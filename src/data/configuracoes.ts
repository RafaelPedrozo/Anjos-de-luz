export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  fields: { label: string; value: string; type?: "text" | "email" | "toggle" }[];
}

export const configSections: ConfigSection[] = [
  {
    id: "empresa",
    title: "Dados da ONG",
    description: "Informações cadastrais da ONG Anjos de Luz",
    fields: [
      { label: "Razão social", value: "ONG Anjos de Luz" },
      { label: "CNPJ", value: "00.000.000/0001-91" },
      { label: "E-mail", value: "contato@anjosdeluz.org", type: "email" },
      { label: "Telefone", value: "(11) 3456-7890" },
    ],
  },
  {
    id: "usuarios",
    title: "Usuários",
    description: "Quem tem acesso à gestão financeira da ONG Anjos de Luz",
    fields: [
      { label: "Administradores", value: "2 usuários" },
      { label: "Operadores", value: "5 usuários" },
      { label: "Convites pendentes", value: "1 convite" },
    ],
  },
  {
    id: "seguranca",
    title: "Segurança",
    description: "Proteção e autenticação",
    fields: [
      { label: "Autenticação em dois fatores", value: "Ativado", type: "toggle" },
      { label: "Última alteração de senha", value: "15/04/2026" },
      { label: "Sessões ativas", value: "3 dispositivos" },
    ],
  },
  {
    id: "aparencia",
    title: "Aparência",
    description: "Personalização visual do sistema",
    fields: [
      { label: "Tema", value: "Anjos de Luz" },
      { label: "Idioma", value: "Português (BR)" },
      { label: "Formato de data", value: "DD/MM/AAAA" },
    ],
  },
  {
    id: "notificacoes",
    title: "Notificações",
    description: "Alertas e lembretes",
    fields: [
      { label: "Vencimentos", value: "Ativado", type: "toggle" },
      { label: "Relatórios semanais", value: "Ativado", type: "toggle" },
      { label: "Novas doações", value: "Desativado", type: "toggle" },
    ],
  },
];
