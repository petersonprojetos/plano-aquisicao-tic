
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const categorias = await prisma.categoria.count();
    const tiposItem = await prisma.tipoItem.count();
    const itens = await prisma.itemTIC.count();
    
    console.log('📊 Estado atual dos dados:');
    console.log('- Categorias:', categorias);
    console.log('- Tipos de Item:', tiposItem);
    console.log('- Itens TIC:', itens);
    
    // Verificar alguns itens se existem
    if (itens > 0) {
      const primeiroItem = await prisma.itemTIC.findFirst();
      console.log('- Primeiro item:', primeiroItem ? primeiroItem.codigo + ' - ' + primeiroItem.descricao : 'Nenhum');
    }
  } catch (error) {
    console.error('Erro ao verificar dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
