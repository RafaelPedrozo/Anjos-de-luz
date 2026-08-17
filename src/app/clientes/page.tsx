import { MainLayout } from "@/components/layout";
import { ClientesPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Clientes" subtitle="Cadastro de clientes">
      <ClientesPage />
    </MainLayout>
  );
}
