import type { Metadata } from "next";
import Link from "next/link";

import loginImage from "@/assets/images/auth-login.jpg";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <AuthScreen
      title="Connexion"
      image={loginImage}
      footer={
        <>
          Pas encore de compte ?
          <Link href="/register" className="ml-1.5 text-brand-dark underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthScreen>
  );
}
