import { MainLayout } from "@/components/layout";
import { SaidasPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Saídas" subtitle="Registre despesas">
      <SaidasPage />
    </MainLayout>
  );
}
