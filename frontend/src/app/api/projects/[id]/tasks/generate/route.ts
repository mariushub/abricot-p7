import { backendRequest } from "@/lib/backend";
import { readText, validateRequiredText } from "@/lib/validation";
import type { GeneratedTask, ProjectDetail } from "@/types/api";

/*
 * Génération de tâches par l'IA (Gemini). La clé API reste sur le serveur :
 * le navigateur n'appelle que cette route, jamais Gemini directement.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const MAX_TASKS = 6;

const SYSTEM_PROMPT = `Tu es l'assistant de gestion de projet de l'application Abricot.
À partir de la demande de l'utilisateur, propose entre 3 et ${MAX_TASKS} tâches concrètes pour le projet.
Chaque tâche a un titre court (moins de 80 caractères), une description d'une ou deux phrases
et une date d'échéance au format AAAA-MM-JJ, postérieure à la date du jour, dans un ordre logique.
Ne propose pas une tâche qui existe déjà. Réponds en français.`;

/** Format JSON imposé à la réponse de Gemini. */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string", description: "Date au format AAAA-MM-JJ" },
        },
        required: ["title", "description", "dueDate"],
      },
    },
  },
  required: ["tasks"],
};

/** « 2026-11-19 » + 7 jours → « 2026-11-26 » */
function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * La réponse de l'IA n'est jamais utilisée telle quelle : chaque tâche est
 * vérifiée, raccourcie si besoin, et une date invalide ou passée est remplacée.
 */
function toGeneratedTask(value: unknown, today: string): GeneratedTask | null {
  if (typeof value !== "object" || value === null) return null;
  const { title, description, dueDate } = value as Record<string, unknown>;
  if (typeof title !== "string" || title.trim().length < 2) return null;

  const cleanTitle = title.trim().slice(0, 200);
  const cleanDescription =
    typeof description === "string" && description.trim() ? description.trim() : cleanTitle;
  const isValidDate =
    typeof dueDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dueDate) &&
    !Number.isNaN(Date.parse(dueDate)) &&
    dueDate >= today;

  return {
    title: cleanTitle,
    description: cleanDescription.slice(0, 1000),
    dueDate: isValidDate ? dueDate : addDays(today, 7),
  };
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

/** Message affiché selon l'erreur renvoyée par Gemini. */
function geminiErrorMessage(status: number): string {
  if (status === 429) return "Le quota gratuit de l'IA est atteint. Réessayez dans une minute.";
  if (status === 503) return "Le service d'IA est surchargé. Réessayez dans quelques instants.";
  return "Le service d'IA a renvoyé une erreur. Réessayez.";
}

/**
 * POST /api/projects/:id/tasks/generate : propose des tâches à partir d'une
 * demande en langage naturel. Rien n'est enregistré : l'utilisateur choisit
 * ensuite les tâches à ajouter (création par POST /api/projects/:id/tasks).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const prompt = readText(await request.formData(), "prompt");
  const promptError = validateRequiredText(prompt, { label: "la demande", min: 5, max: 500 });
  if (promptError) return Response.json({ fieldErrors: { prompt: promptError } }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { message: "La génération par IA n'est pas configurée sur ce serveur." },
      { status: 500 },
    );
  }

  // Le projet donne du contexte à l'IA, et vérifie que l'utilisateur en est membre.
  const projectResult = await backendRequest<{ project: ProjectDetail }>(
    `/projects/${encodeURIComponent((await params).id)}`,
  );
  if (!projectResult.ok) {
    const status = projectResult.status === 403 ? 404 : projectResult.status;
    return Response.json({ message: projectResult.message }, { status });
  }
  const { project } = projectResult.data;
  const today = new Date().toISOString().slice(0, 10);
  const existingTitles = project.tasks.map((task) => `- ${task.title}`).join("\n") || "(aucune)";

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Projet : ${project.name}\nDescription : ${project.description ?? ""}\nDate du jour : ${today}\nTâches existantes :\n${existingTitles}\n\nDemande : ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: RESPONSE_SCHEMA,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch {
    return Response.json(
      { message: "Le service d'IA n'a pas répondu à temps. Réessayez." },
      { status: 504 },
    );
  }
  if (!response.ok) {
    return Response.json({ message: geminiErrorMessage(response.status) }, { status: 502 });
  }

  try {
    const body: GeminiResponse = await response.json();
    const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
    const { tasks } = JSON.parse(text ?? "") as { tasks: unknown[] };
    const generatedTasks = tasks
      .map((task) => toGeneratedTask(task, today))
      .filter((task) => task !== null)
      .slice(0, MAX_TASKS);
    if (generatedTasks.length === 0) throw new Error("Aucune tâche exploitable");
    return Response.json({ tasks: generatedTasks });
  } catch {
    return Response.json(
      { message: "L'IA n'a pas proposé de tâches exploitables. Reformulez votre demande." },
      { status: 502 },
    );
  }
}
