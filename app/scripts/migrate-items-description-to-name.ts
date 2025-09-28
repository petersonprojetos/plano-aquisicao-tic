
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando migração de dados de itens...");

  // Buscar todos os itens 
  const allItems = await prisma.item.findMany({
    select: {
      id: true,
      code: true,
      description: true,
      name: true
    }
  });

  // Filtrar itens que precisam de migração
  const itemsToMigrate = allItems.filter(item => 
    (!item.name || item.name === "") && item.description
  );

  console.log(`📊 Encontrados ${itemsToMigrate.length} itens para migrar`);

  if (itemsToMigrate.length === 0) {
    console.log("✅ Nenhum item precisa ser migrado.");
    return;
  }

  // Migrar dados um por um
  let migratedCount = 0;
  for (const item of itemsToMigrate) {
    try {
      await prisma.item.update({
        where: { id: item.id },
        data: {
          name: item.description || "" // Mover description para name
          // Mantemos description com o valor original por enquanto
        }
      });
      
      console.log(`✅ Migrado item ${item.code}: "${item.description}"`);
      migratedCount++;
    } catch (error) {
      console.error(`❌ Erro ao migrar item ${item.code}:`, error);
    }
  }

  console.log(`🎉 Migração concluída! ${migratedCount} itens migrados com sucesso.`);
  console.log("📝 Nota: Os valores de 'description' foram mantidos para compatibilidade.");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
