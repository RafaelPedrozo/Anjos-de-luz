import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 12);

  const empresa = await prisma.empresa.upsert({
    where: { cnpj: "12345678000190" },
    update: {},
    create: {
      razaoSocial: "ViaConeta Gestão Financeira Ltda",
      nomeFantasia: "ViaConeta",
      cnpj: "12345678000190",
      telefone: "(11) 3456-7890",
      email: "contato@viaconeta.com.br",
      endereco: "Av. Paulista, 1000 - São Paulo, SP",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "admin@viaconeta.com.br" },
    update: {},
    create: {
      nome: "João Martins",
      email: "admin@viaconeta.com.br",
      senhaHash,
      perfil: "ADMINISTRADOR",
      empresaId: empresa.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "funcionario@viaconeta.com.br" },
    update: {},
    create: {
      nome: "Maria Silva",
      email: "funcionario@viaconeta.com.br",
      senhaHash: await bcrypt.hash("func123", 12),
      perfil: "FUNCIONARIO",
      empresaId: empresa.id,
    },
  });

  await prisma.lembreteEmail.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.entrada.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.saida.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.contaPagar.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.cliente.deleteMany({ where: { empresaId: empresa.id } });

  await prisma.entrada.createMany({
    data: [
      {
        data: new Date("2026-05-25"),
        descricao: "Venda de produtos - Cliente XYZ",
        categoria: "Vendas",
        cliente: "Cliente XYZ",
        formaPagamento: "PIX",
        valor: 12500,
        status: "RECEBIDO",
        empresaId: empresa.id,
      },
      {
        data: new Date("2026-05-22"),
        descricao: "Recebimento serviço - Cliente ABC",
        categoria: "Serviços",
        cliente: "Cliente ABC",
        formaPagamento: "PIX",
        valor: 5800,
        status: "RECEBIDO",
        empresaId: empresa.id,
      },
    ],
  });

  await prisma.saida.createMany({
    data: [
      {
        data: new Date("2026-05-24"),
        descricao: "Salários - Equipe Vendas",
        categoria: "Salários",
        fornecedor: "Folha de Pagamento",
        formaPagamento: "Transferência",
        valor: 8300,
        status: "PAGO",
        empresaId: empresa.id,
      },
    ],
  });

  await prisma.configNotificacao.upsert({
    where: { empresaId: empresa.id },
    update: {},
    create: {
      empresaId: empresa.id,
      emailVencimentosAtivo: true,
      emailDestino: "contato@viaconeta.com.br",
      emailDiasAntes: 3,
      emailNoDiaVencimento: true,
      emailAtrasados: true,
    },
  });

  const emTresDias = new Date();
  emTresDias.setDate(emTresDias.getDate() + 3);
  emTresDias.setHours(12, 0, 0, 0);

  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);

  await prisma.contaPagar.createMany({
    data: [
      {
        descricao: "Fornecedor XYZ",
        fornecedor: "Fornecedor XYZ",
        valor: 15200,
        vencimento: emTresDias,
        status: "PENDENTE",
        empresaId: empresa.id,
      },
      {
        descricao: "Energia Elétrica",
        fornecedor: "Companhia Elétrica",
        valor: 3200,
        vencimento: hoje,
        status: "PENDENTE",
        empresaId: empresa.id,
      },
    ],
  });

  await prisma.cliente.createMany({
    data: [
      {
        nome: "Cliente XYZ",
        telefone: "(11) 98765-4321",
        email: "contato@clientexyz.com.br",
        documento: "12.345.678/0001-90",
        endereco: "Av. Paulista, 1000",
        status: "ATIVO",
        empresaId: empresa.id,
      },
    ],
  });

  console.log("Seed concluído:");
  console.log("  Admin: admin@viaconeta.com.br / admin123");
  console.log("  Funcionário: funcionario@viaconeta.com.br / func123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
