import { MainLayout } from "@/components/layout";
import { AnimaisPage } from "@/components/pages";

export default function Page() {
  return (
    <MainLayout title="Animais & Resgates" subtitle="Cadastro de animais e registro de resgates">
      <AnimaisPage />
    </MainLayout>
  );
}
