import type { Metadata } from "next";

import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
