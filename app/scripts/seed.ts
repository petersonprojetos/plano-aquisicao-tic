
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Verificar se já existem dados básicos para evitar duplicações
  const existingDeptCount = await prisma.department.count();
  const existingUserCount = await prisma.user.count();

  if (existingDeptCount > 0 && existingUserCount > 0) {
    console.log(`ℹ️ Dados já existem no banco (${existingDeptCount} departamentos, ${existingUserCount} usuários)`);
    console.log("✨ Seed concluído sem alterações - dados já presentes");
    return;
  }

  // Criar apenas o Departamento TI (mínimo necessário)
  console.log("📁 Criando departamento TI (mínimo necessário)...");
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: "TI" },
      update: {},
      create: {
        name: "Tecnologia da Informação",
        code: "TI",
        commander: "Carlos Silva",
        phone: "(11) 9999-1234",
        address: "Rua das Tecnologias, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        country: "Brasil",
        annualBudget: 500000.00,
        observations: "Departamento responsável pela infraestrutura de TI da empresa",
        isActive: true,
        sigla_departamento: "TI",
      },
    }),
  ]);

  console.log(`✅ ${departments.length} departamento criado/atualizado (apenas TI)`);

  // Criar apenas os 4 usuários essenciais do TI
  console.log("👥 Criando usuários essenciais do TI (4 usuários)...");
  
  const hashedPassword = await bcrypt.hash("123456", 12);
  const adminPassword = await bcrypt.hash("johndoe123", 12);

  const users = await Promise.all([
    // Usuário admin (obrigatório para teste)
    prisma.user.upsert({
      where: { email: "john@doe.com" },
      update: {},
      create: {
        email: "john@doe.com",
        password: adminPassword,
        name: "John Doe",
        role: "ADMIN",
        departmentId: departments[0].id, // TI
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Gestor de TI
    prisma.user.upsert({
      where: { email: "gestor.ti@empresa.com" },
      update: {},
      create: {
        email: "gestor.ti@empresa.com",
        password: hashedPassword,
        name: "Carlos Silva",
        role: "MANAGER",
        departmentId: departments[0].id, // TI
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Usuário TI 1
    prisma.user.upsert({
      where: { email: "usuario.ti@empresa.com" },
      update: {},
      create: {
        email: "usuario.ti@empresa.com",
        password: hashedPassword,
        name: "Ana Santos",
        role: "USER",
        departmentId: departments[0].id, // TI
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    // Aprovador Geral do TI
    prisma.user.upsert({
      where: { email: "aprovador.geral@empresa.com" },
      update: {},
      create: {
        email: "aprovador.geral@empresa.com",
        password: hashedPassword,
        name: "Lucas Fernandes",
        role: "APPROVER",
        departmentId: departments[0].id, // TI
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários essenciais do TI criados/atualizados`);

  console.log("🎉 Seed concluído com sucesso! (Apenas dados mínimos necessários)");
  console.log("\n📊 Estado final do banco:");
  console.log("- 1 departamento (TI - Tecnologia da Informação)");
  console.log("- 4 usuários essenciais do departamento TI");
  console.log("- 0 tipos de item");
  console.log("- 0 itens");  
  console.log("- 0 solicitações");
  
  console.log("\n🔑 Usuários criados:");
  console.log("Admin: john@doe.com / johndoe123");
  console.log("Gestor TI: gestor.ti@empresa.com / 123456");
  console.log("Usuário TI: usuario.ti@empresa.com / 123456");
  console.log("Aprovador Geral: aprovador.geral@empresa.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
