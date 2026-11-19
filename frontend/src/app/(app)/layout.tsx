import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/SkipLink";

/**
 * Layout des pages connectées : en-tête avec navigation, contenu, pied de page.
 * L'accès est contrôlé par le proxy (src/proxy.ts) et par les routes /api (src/app/api),
 * pas ici : un layout n'est pas ré-exécuté à chaque navigation.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto w-full max-w-360 flex-1 px-4 py-10 outline-none md:px-10 lg:py-16 xl:px-25"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
