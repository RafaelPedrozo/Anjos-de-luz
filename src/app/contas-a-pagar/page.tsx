import { MainLayout } from "@/components/layout";
import { ContasAPagarPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Contas a Pagar" subtitle="Gerencie vencimentos">
      <ContasAPagarPage />
    </MainLayout>
  );
}
