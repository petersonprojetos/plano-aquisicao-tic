
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStructure() {
  try {
    console.log('=== VERIFICANDO ESTRUTURA DAS TABELAS ===');
    
    // Verificar categorias
    const categories = await prisma.itemCategoryMaster.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' }
    });
    console.log('\n=== CATEGORIAS (ItemCategoryMaster) ===');
    console.log(`Total: ${categories.length}`);
    categories.forEach(cat => console.log(`${cat.code} - ${cat.name}`));
    
    // Verificar tipos
    const types = await prisma.itemTypeMaster.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' }
    });
    console.log('\n=== TIPOS DE ITEM (ItemTypeMaster) ===');
    console.log(`Total: ${types.length}`);
    types.forEach(type => console.log(`${type.code} - ${type.name}`));
    
    // Verificar itens (apenas uma amostra)
    const items = await prisma.item.findMany({
      select: {
        id: true,
        code: true, 
        name: true,
        categoryId: true,
        typeId: true,
        category: { select: { code: true, name: true } },
        type: { select: { code: true, name: true } }
      },
      take: 5,
      orderBy: { code: 'asc' }
    });
    console.log('\n=== ITENS (com relacionamentos - amostra de 5) ===');
    console.log(`Total de itens na base: ${await prisma.item.count()}`);
    items.forEach(item => {
      console.log(`\nItem: ${item.code} - ${item.name}`);
      console.log(`  Tipo: ${item.type?.code} - ${item.type?.name}`);
      console.log(`  Categoria: ${item.category?.code} - ${item.category?.name}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStructure();
