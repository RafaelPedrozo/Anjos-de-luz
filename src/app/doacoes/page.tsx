import { MainLayout } from "@/components/layout";
import { DoacoesPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Doações de Dinheiro" subtitle="PIX e cartão recebidos pela ONG">
      <DoacoesPage />
    </MainLayout>
  );
}
