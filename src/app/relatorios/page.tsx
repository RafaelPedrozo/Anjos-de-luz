import { MainLayout } from "@/components/layout";
import { RelatoriosPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Relatórios" subtitle="Visualização financeira">
      <RelatoriosPage />
    </MainLayout>
  );
}
