import { MainLayout } from "@/components/layout";
import { ConfiguracoesStaticSection } from "@/components/pages/ConfiguracoesSections";

export default function Page() {
  return (
    <MainLayout title="Configurações" subtitle="Aparência">
      <ConfiguracoesStaticSection
        title="Aparência"
        description="Personalização visual do sistema"
        fields={[
          { label: "Tema", value: "Anjos de Luz" },
          { label: "Idioma", value: "Português (BR)" },
          { label: "Formato de data", value: "DD/MM/AAAA" },
        ]}
      />
    </MainLayout>
  );
}
