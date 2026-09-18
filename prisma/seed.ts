import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ONG_PADRAO } from "../src/lib/ong";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 12);

  const empresas = await prisma.empresa.findMany();
  if (empresas.length === 0) {
    empresas.push(
      await prisma.empresa.create({
        data: {
          razaoSocial: ONG_PADRAO.razaoSocial,
          nomeFantasia: ONG_PADRAO.nomeFantasia,
          cnpj: ONG_PADRAO.cnpj,
          telefone: ONG_PADRAO.telefone,
          email: ONG_PADRAO.email,
          endereco: ONG_PADRAO.endereco,
        },
      }),
    );
  } else {
    for (const item of empresas) {
      await prisma.empresa.update({
        where: { id: item.id },
        data: {
          razaoSocial: ONG_PADRAO.razaoSocial,
          nomeFantasia: ONG_PADRAO.nomeFantasia,
          email: ONG_PADRAO.email,
        },
      });
    }
  }

  const empresa = empresas[0]!;

  await prisma.usuario.upsert({
    where: { email: "admin@anjosdeluz.org" },
    update: { empresaId: empresa.id, perfil: "ADMINISTRADOR" },
    create: {
      nome: "João Martins",
      email: "admin@anjosdeluz.org",
      senhaHash,
      perfil: "ADMINISTRADOR",
      empresaId: empresa.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: "funcionario@anjosdeluz.org" },
    update: { empresaId: empresa.id },
    create: {
      nome: "Maria Silva",
      email: "funcionario@anjosdeluz.org",
      senhaHash: await bcrypt.hash("func123", 12),
      perfil: "FUNCIONARIO",
      empresaId: empresa.id,
    },
  });

  for (const ong of await prisma.empresa.findMany()) {
    await seedDemoOng(ong.id);
  }
}

async function seedDemoOng(empresaId: string) {
  await prisma.adocao.deleteMany({ where: { empresaId } });
  await prisma.resgate.deleteMany({ where: { empresaId } });
  await prisma.doacao.deleteMany({ where: { empresaId } });
  await prisma.animal.deleteMany({ where: { empresaId } });

  const thor = await prisma.animal.create({
    data: {
      nome: "Thor",
      especie: "Cão",
      status: "DISPONIVEL",
      foto: "",
      dataResgate: new Date("2026-03-12"),
      empresaId,
    },
  });
  const luna = await prisma.animal.create({
    data: {
      nome: "Luna",
      especie: "Gato",
      status: "ADOTADO",
      foto: "",
      dataResgate: new Date("2026-01-20"),
      empresaId,
    },
  });
  const belinha = await prisma.animal.create({
    data: {
      nome: "Belinha",
      especie: "Cão",
      status: "TRATAMENTO",
      foto: "",
      dataResgate: new Date("2026-08-02"),
      empresaId,
    },
  });
  const mimi = await prisma.animal.create({
    data: {
      nome: "Mimi",
      especie: "Gato",
      status: "DISPONIVEL",
      foto: "",
      dataResgate: new Date("2026-06-15"),
      empresaId,
    },
  });
  const nick = await prisma.animal.create({
    data: {
      nome: "Nick",
      especie: "Cão",
      status: "ADOTADO",
      foto: "",
      dataResgate: new Date("2026-04-08"),
      empresaId,
    },
  });

  await prisma.resgate.createMany({
    data: [
      {
        local: "Av. 9 de Julho, Pindamonhangaba",
        custos: 180,
        descricao: "Resgate de cão adulto atropelado, encaminhado ao veterinário.",
        data: new Date("2026-03-12"),
        animalId: thor.id,
        empresaId,
      },
      {
        local: "Centro — caixa de papelão",
        custos: 90,
        descricao: "Filhote de gato abandonada próxima ao mercado.",
        data: new Date("2026-01-20"),
        animalId: luna.id,
        empresaId,
      },
      {
        local: "Rodovia Presidente Dutra, km 72",
        custos: 420,
        descricao: "Cadela com ferimento na pata, em tratamento.",
        data: new Date("2026-08-02"),
        animalId: belinha.id,
        empresaId,
      },
      {
        local: "Bairro Cidade Nova",
        custos: 60,
        descricao: "Gata resgatada após denúncia de maus-tratos.",
        data: new Date("2026-06-15"),
        animalId: mimi.id,
        empresaId,
      },
      {
        local: "Praça da República",
        custos: 150,
        descricao: "Cão de porte médio encontrado solto no parque.",
        data: new Date("2026-04-08"),
        animalId: nick.id,
        empresaId,
      },
    ],
  });

  await prisma.adocao.createMany({
    data: [
      {
        animalId: luna.id,
        adotanteNome: "Ana Paula Rocha",
        adotanteEmail: "ana.rocha@email.com",
        adotanteTelefone: "(12) 98222-3344",
        data: new Date("2026-03-05"),
        empresaId,
      },
      {
        animalId: nick.id,
        adotanteNome: "Carlos Eduardo Souza",
        adotanteEmail: "carlos@email.com",
        adotanteTelefone: "(12) 98111-2233",
        data: new Date("2026-07-18"),
        empresaId,
      },
    ],
  });

  await prisma.doacao.createMany({
    data: [
      { valor: 250, tipo: "PIX", doador: "Carlos Eduardo Souza", data: new Date("2026-04-10"), empresaId },
      { valor: 1200, tipo: "PIX", doador: "Comunidade Local", data: new Date("2026-05-18"), empresaId },
      { valor: 300, tipo: "CARTAO", doador: "Roberto Mendes", data: new Date("2026-06-20"), empresaId },
      { valor: 480, tipo: "PIX", doador: "Fernanda Lima", data: new Date("2026-07-08"), empresaId },
      { valor: 75, tipo: "PIX", doador: "Gabriel Martins", data: new Date("2026-08-19"), empresaId },
      { valor: 200, tipo: "CARTAO", doador: "Camila Ferreira", data: new Date("2026-09-10"), empresaId },
      { valor: 850, tipo: "PIX", doador: "Lucas Oliveira", data: new Date("2026-09-15"), empresaId },
    ],
  });

  await prisma.configNotificacao.upsert({
    where: { empresaId },
    update: {},
    create: { empresaId },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
