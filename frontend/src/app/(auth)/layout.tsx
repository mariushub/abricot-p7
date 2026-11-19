/** Layout des pages d'authentification : pas d'en-tête ni de navigation. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1">{children}</main>;
}
