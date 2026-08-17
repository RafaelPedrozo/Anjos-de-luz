import { MainLayout } from "@/components/layout";
import { ConfiguracoesUsuariosWrapper } from "@/components/pages/ConfiguracoesSections";

export default function Page() {
  return (
    <MainLayout title="Configurações" subtitle="Usuários do sistema">
      <ConfiguracoesUsuariosWrapper />
    </MainLayout>
  );
}
