import type { Metadata } from "next";

import { AccountContent } from "@/components/account/AccountContent";

export const metadata: Metadata = {
  title: "Mon compte",
};

export default function AccountPage() {
  return <AccountContent />;
}
