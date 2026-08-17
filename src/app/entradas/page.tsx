import { MainLayout } from "@/components/layout";
import { EntradasPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Entradas" subtitle="Registre todo dinheiro recebido">
      <EntradasPage />
    </MainLayout>
  );
}
