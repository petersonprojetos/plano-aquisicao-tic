
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== VERIFICAÇÃO DO ESTADO DO BANCO ===');
    
    // Contar registros em cada tabela
    const requestsCount = await prisma.request.count();
    const itemsCount = await prisma.item.count();
    const itemTypesCount = await prisma.itemTypeMaster.count();
    const departmentsCount = await prisma.department.count();
    const usersCount = await prisma.user.count();

    console.log(`\n📊 CONTAGEM DE REGISTROS:`);
    console.log(`   - Solicitações (requests): ${requestsCount}`);
    console.log(`   - Itens (items): ${itemsCount}`);
    console.log(`   - Tipos de Item (itemTypeMaster): ${itemTypesCount}`);
    console.log(`   - Departamentos (departments): ${departmentsCount}`);
    console.log(`   - Usuários (users): ${usersCount}`);

    // Mostrar as solicitações existentes, se houver
    if (requestsCount > 0) {
      console.log('\n📋 SOLICITAÇÕES EXISTENTES:');
      const requests = await prisma.request.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { itemName: true, quantity: true, totalValue: true } },
          department: { select: { name: true } }
        }
      });

      requests.forEach((request, index) => {
        console.log(`\n   ${index + 1}. Solicitação ID: ${request.id}`);
        console.log(`      - Número: ${request.requestNumber}`);
        console.log(`      - Solicitante: ${request.requesterName}`);
        console.log(`      - Usuário: ${request.user?.name} (${request.user?.email})`);
        console.log(`      - Departamento: ${request.department?.name}`);
        console.log(`      - Status: ${request.status}`);
        console.log(`      - Valor Total: R$ ${request.totalValue}`);
        console.log(`      - Itens (${request.items.length}):`);
        request.items.forEach((item, itemIndex) => {
          console.log(`         ${itemIndex + 1}. ${item.itemName} - Qtd: ${item.quantity} - Valor: R$ ${item.totalValue}`);
        });
        console.log(`      - Criado em: ${request.createdAt.toLocaleString('pt-BR')}`);
      });
    } else {
      console.log('\n❌ Nenhuma solicitação encontrada no banco de dados.');
      console.log('   Isso confirma que os dados foram perdidos durante o reset do banco.');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
