import { MainLayout } from "@/components/layout";
import { RelatoriosPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Relatórios" subtitle="Doações, resgates e atividades da ONG">
      <RelatoriosPage />
    </MainLayout>
  );
}
