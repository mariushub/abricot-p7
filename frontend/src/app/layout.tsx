import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/* Police du texte courant (styles Body et Caption de la maquette) */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/* Police des titres (styles Headings de la maquette) */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Chaque page définit son titre : « Mes projets | Abricot ».
  title: { template: "%s | Abricot", default: "Abricot" },
  description: "Abricot, l'outil de gestion de projet pensé pour les freelances.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        {/* Notifications (création, suppression…), annoncées aux lecteurs d'écran. */}
        <Toaster position="bottom-right" closeButton toastOptions={{ className: "font-sans" }} />
      </body>
    </html>
  );
}
