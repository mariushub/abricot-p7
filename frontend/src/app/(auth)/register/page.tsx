import type { Metadata } from "next";
import Link from "next/link";

import registerImage from "@/assets/images/auth-register.jpg";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function RegisterPage() {
  return (
    <AuthScreen
      title="Inscription"
      image={registerImage}
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/login" className="ml-1.5 text-brand-dark underline">
            Se connecter
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthScreen>
  );
}
