/*
 * Formatage en français (dates, pluriels) et calculs sur les mois.
 * Les échéances sont des dates sans heure : le backend les stocke à minuit UTC,
 * on les traite donc en UTC pour afficher le jour choisi, quel que soit le
 * fuseau du serveur ou du navigateur (et éviter un écart entre les deux rendus).
 */

const DUE_DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const COMMENT_DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

/** « 2026-03-09T00:00:00.000Z » → « 9 mars » */
export function formatDueDate(isoDate: string): string {
  return DUE_DATE_FORMAT.format(new Date(isoDate));
}

/** Date et heure d'un commentaire : « 23 mars, 11:20 » */
export function formatCommentDate(isoDate: string): string {
  const parts = COMMENT_DATE_FORMAT.formatToParts(new Date(isoDate));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}`;
}

/** Valeur attendue par <input type="date"> : « 2026-03-09 ». */
export function toDateInputValue(isoDate: string | null | undefined): string {
  return isoDate ? isoDate.slice(0, 10) : "";
}

/** Accorde un mot au pluriel : pluralize(3, "personne") → « 3 personnes ». */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}

/* Mois (Kanban, calendrier) : un mois est représenté par la date de son premier jour à 00:00 UTC. */

const MONTH_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(month: Date, count: number): Date {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + count, 1));
}

export function isInMonth(isoDate: string, month: Date): boolean {
  const date = new Date(isoDate);
  return (
    date.getUTCFullYear() === month.getUTCFullYear() && date.getUTCMonth() === month.getUTCMonth()
  );
}

/** « novembre 2026 » */
export function formatMonth(month: Date): string {
  return MONTH_FORMAT.format(month);
}

/**
 * Mois affiché par défaut : celui de l'échéance la plus proche d'aujourd'hui
 * (passée ou future), ou le mois courant s'il n'y a aucune échéance.
 */
export function getDefaultMonth(dueDates: (string | null)[], today = new Date()): Date {
  let nearest: Date | null = null;
  for (const isoDate of dueDates) {
    if (!isoDate) continue;
    const date = new Date(isoDate);
    if (
      !nearest ||
      Math.abs(date.getTime() - today.getTime()) < Math.abs(nearest.getTime() - today.getTime())
    ) {
      nearest = date;
    }
  }
  return startOfMonth(nearest ?? today);
}

/**
 * Jours à afficher dans la grille d'un mois, semaines commençant le lundi.
 * Les cases avant le 1er du mois valent null.
 */
export function getCalendarDays(month: Date): (Date | null)[] {
  const daysInMonth = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const leadingBlanks = (month.getUTCDay() + 6) % 7; // lundi = 0
  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), index + 1)),
    ),
  ];
}
