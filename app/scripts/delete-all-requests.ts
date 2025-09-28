
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function deleteAllRequests() {
  try {
    console.log('=== DELETANDO TODAS AS SOLICITAÇÕES ===\n');
    
    // Primeiro, vamos ver o que será deletado
    const requestsToDelete = await prisma.request.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { itemName: true, quantity: true, totalValue: true } },
        department: { select: { name: true } }
      }
    });

    console.log(`📋 ENCONTRADAS ${requestsToDelete.length} SOLICITAÇÕES PARA DELETAR:\n`);
    
    if (requestsToDelete.length === 0) {
      console.log('✅ Nenhuma solicitação encontrada para deletar.');
      return;
    }

    // Mostrar as solicitações que serão deletadas
    requestsToDelete.forEach((request, index) => {
      console.log(`   ${index + 1}. ${request.requestNumber} - ${request.requesterName}`);
      console.log(`      - Usuário: ${request.user?.name} (${request.user?.email})`);
      console.log(`      - Departamento: ${request.department?.name}`);
      console.log(`      - Status: ${request.status}`);
      console.log(`      - Valor: R$ ${request.totalValue}`);
      console.log(`      - Itens: ${request.items.length}`);
    });

    console.log('\n🗑️ INICIANDO DELEÇÃO...\n');

    // Deletar em ordem correta devido às foreign keys:
    // 1. RequestHistory
    // 2. Notifications 
    // 3. RequestItems
    // 4. Requests

    // 1. Deletar histórico das solicitações
    const historyCount = await prisma.requestHistory.deleteMany({});
    console.log(`✅ Deletados ${historyCount.count} registros de histórico`);

    // 2. Deletar notificações das solicitações
    const notificationsCount = await prisma.notification.deleteMany({});
    console.log(`✅ Deletadas ${notificationsCount.count} notificações`);

    // 3. Deletar itens das solicitações
    const itemsCount = await prisma.requestItem.deleteMany({});
    console.log(`✅ Deletados ${itemsCount.count} itens de solicitações`);

    // 4. Finalmente, deletar as solicitações
    const requestsCount = await prisma.request.deleteMany({});
    console.log(`✅ Deletadas ${requestsCount.count} solicitações`);

    console.log('\n🎉 TODAS AS SOLICITAÇÕES FORAM DELETADAS COM SUCESSO!');
    
    // Verificar se realmente foi tudo deletado
    const remainingRequests = await prisma.request.count();
    console.log(`\n📊 VERIFICAÇÃO FINAL: ${remainingRequests} solicitações restantes no banco`);

    if (remainingRequests === 0) {
      console.log('✅ Confirmado: Banco limpo de todas as solicitações');
    } else {
      console.log('⚠️ Ainda existem solicitações no banco - pode ter havido algum erro');
    }

  } catch (error) {
    console.error('❌ Erro ao deletar solicitações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllRequests();
