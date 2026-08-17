import { MainLayout } from "@/components/layout";
import { ConfiguracoesEmpresaPage } from "@/components/pages/ConfiguracoesEmpresaPage";

export default function Page() {
  return (
    <MainLayout title="Configurações" subtitle="Preferências do sistema">
      <ConfiguracoesEmpresaPage />
    </MainLayout>
  );
}
