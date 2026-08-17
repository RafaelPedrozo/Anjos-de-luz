export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  fields: { label: string; value: string; type?: "text" | "email" | "toggle" }[];
}

export const configSections: ConfigSection[] = [
  {
    id: "empresa",
    title: "Dados da empresa",
    description: "Informações cadastrais da organização",
    fields: [
      { label: "Razão social", value: "ViaConeta Gestão Financeira Ltda" },
      { label: "CNPJ", value: "12.345.678/0001-90" },
      { label: "E-mail", value: "contato@viaconeta.com.br", type: "email" },
      { label: "Telefone", value: "(11) 3456-7890" },
    ],
  },
  {
    id: "usuarios",
    title: "Usuários",
    description: "Gerencie o acesso ao sistema",
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
      { label: "Tema", value: "Dark Premium" },
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
      { label: "Novas entradas", value: "Desativado", type: "toggle" },
    ],
  },
];
