import { MainLayout } from "@/components/layout";
import { ConfiguracoesNotificacoesPage } from "@/components/pages/ConfiguracoesNotificacoesPage";

export default function Page() {
  return (
    <MainLayout title="Configurações" subtitle="Notificações por e-mail">
      <ConfiguracoesNotificacoesPage />
    </MainLayout>
  );
}
