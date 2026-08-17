import { MainLayout } from "@/components/layout";
import { DashboardContent } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard" subtitle="Visão geral das finanças">
      <DashboardContent />
    </MainLayout>
  );
}
