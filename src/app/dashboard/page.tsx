import { MainLayout } from "@/components/layout";
import { DashboardContent } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard" subtitle="Visão geral de animais, adoções e doações">
      <DashboardContent />
    </MainLayout>
  );
}
