import { MainLayout } from "@/components/layout";
import { ConfiguracoesStaticSection } from "@/components/pages/ConfiguracoesSections";

export default function Page() {
  return (
    <MainLayout title="Configurações" subtitle="Segurança">
      <ConfiguracoesStaticSection
        title="Segurança"
        description="Proteção e autenticação"
        fields={[
          { label: "Autenticação JWT", value: "Ativado" },
          { label: "Hash de senha", value: "bcrypt (12 rounds)" },
          { label: "Sessão", value: "7 dias" },
        ]}
      />
    </MainLayout>
  );
}
