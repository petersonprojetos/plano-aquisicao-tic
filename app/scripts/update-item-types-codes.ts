
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateItemTypesCodes() {
  try {
    console.log('🔍 Verificando tipos de itens existentes...');
    
    // Buscar todos os tipos de item ordenados por data de criação
    const itemTypes = await prisma.itemTypeMaster.findMany({
      orderBy: {
        createdAt: 'asc'  // Ordenar por data de criação para manter consistência
      }
    });

    console.log(`📊 Total de tipos de item encontrados: ${itemTypes.length}`);

    if (itemTypes.length === 0) {
      console.log('✅ Não há tipos de item para atualizar.');
      return;
    }

    console.log('\n📋 Tipos de item atuais:');
    itemTypes.forEach((item, index) => {
      console.log(`   ${index + 1}. ID: ${item.id} | Código atual: ${item.code} | Nome: ${item.name}`);
    });

    console.log('\n🔄 Iniciando atualização dos códigos...');
    console.log('   Novo padrão: começando em 1200 e incrementando +1');

    // Atualizar cada tipo de item com o novo código
    let updatedCount = 0;
    
    for (let i = 0; i < itemTypes.length; i++) {
      const newCode = (1200 + i).toString();
      const itemType = itemTypes[i];
      
      console.log(`   🔄 Atualizando: "${itemType.name}" | Código: ${itemType.code} → ${newCode}`);
      
      try {
        await prisma.itemTypeMaster.update({
          where: { id: itemType.id },
          data: { code: newCode }
        });
        updatedCount++;
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar ${itemType.name}:`, error);
      }
    }

    console.log(`\n✅ ${updatedCount} tipos de item atualizados com sucesso!`);

    // Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const updatedItemTypes = await prisma.itemTypeMaster.findMany({
      orderBy: {
        code: 'asc'  // Ordenar por código para ver a sequência
      }
    });

    console.log('\n📋 Tipos de item após atualização:');
    updatedItemTypes.forEach((item, index) => {
      console.log(`   ${index + 1}. Código: ${item.code} | Nome: ${item.name}`);
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar códigos dos tipos de item:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
updateItemTypesCodes()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na execução do script:', error);
    process.exit(1);
  });
