import { MainLayout } from "@/components/layout";
import { AdocoesPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Adoções" subtitle="Vínculo entre animais e adotantes">
      <AdocoesPage />
    </MainLayout>
  );
}
