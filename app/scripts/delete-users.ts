
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function deleteSpecificUsers() {
  try {
    console.log('=== DELETANDO USUÁRIOS ESPECÍFICOS ===\n');
    
    const usersToDelete = [
      'Pedro Costa',
      'Maria Oliveira', 
      'João Pereira'
    ];

    console.log('👤 USUÁRIOS A SEREM DELETADOS:');
    usersToDelete.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });

    // Primeiro, vamos verificar se esses usuários existem e TODAS as suas dependências
    const existingUsers = await prisma.user.findMany({
      where: {
        name: {
          in: usersToDelete
        }
      },
      include: {
        department: { select: { name: true } },
        requests: { select: { id: true, requestNumber: true, status: true } },
        annualPlansCreated: { select: { id: true, year: true, departmentId: true } },
        annualPlansUpdated: { select: { id: true, year: true, departmentId: true } },
        notifications: { select: { id: true, title: true } }
      }
    });

    console.log(`\n📋 ENCONTRADOS ${existingUsers.length} USUÁRIOS NO BANCO:\n`);

    if (existingUsers.length === 0) {
      console.log('❌ Nenhum dos usuários especificados foi encontrado no banco de dados.');
      return;
    }

    // Mostrar detalhes dos usuários encontrados e TODAS suas dependências
    existingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name}`);
      console.log(`      - Email: ${user.email}`);
      console.log(`      - Departamento: ${user.department?.name || 'Sem departamento'}`);
      console.log(`      - Solicitações: ${user.requests.length}`);
      console.log(`      - Planos Anuais Criados: ${user.annualPlansCreated.length}`);
      console.log(`      - Planos Anuais Atualizados: ${user.annualPlansUpdated.length}`);
      console.log(`      - Notificações: ${user.notifications.length}`);
      
      if (user.requests.length > 0) {
        console.log('      ⚠️ SOLICITAÇÕES:');
        user.requests.forEach((req, reqIndex) => {
          console.log(`         ${reqIndex + 1}. ${req.requestNumber} (${req.status})`);
        });
      }
      
      if (user.annualPlansCreated.length > 0) {
        console.log('      ⚠️ PLANOS ANUAIS CRIADOS:');
        user.annualPlansCreated.forEach((plan, planIndex) => {
          console.log(`         ${planIndex + 1}. Ano ${plan.year} - Dept ID: ${plan.departmentId}`);
        });
      }
      
      if (user.annualPlansUpdated.length > 0) {
        console.log('      ⚠️ PLANOS ANUAIS ATUALIZADOS:');
        user.annualPlansUpdated.forEach((plan, planIndex) => {
          console.log(`         ${planIndex + 1}. Ano ${plan.year} - Dept ID: ${plan.departmentId}`);
        });
      }
    });

    // Verificar se algum usuário tem dependências
    const usersWithDependencies = existingUsers.filter(user => 
      user.requests.length > 0 || 
      user.annualPlansCreated.length > 0 || 
      user.annualPlansUpdated.length > 0 ||
      user.notifications.length > 0
    );
    
    if (usersWithDependencies.length > 0) {
      console.log('\n⚠️ AVISO: Os seguintes usuários possuem dependências:');
      usersWithDependencies.forEach(user => {
        const deps = [];
        if (user.requests.length > 0) deps.push(`${user.requests.length} solicitação(ões)`);
        if (user.annualPlansCreated.length > 0) deps.push(`${user.annualPlansCreated.length} plano(s) criado(s)`);
        if (user.annualPlansUpdated.length > 0) deps.push(`${user.annualPlansUpdated.length} plano(s) atualizado(s)`);
        if (user.notifications.length > 0) deps.push(`${user.notifications.length} notificação(ões)`);
        console.log(`   - ${user.name}: ${deps.join(', ')}`);
      });
      
      console.log('\n🗑️ DELETANDO DEPENDÊNCIAS PRIMEIRO...\n');
      
      // Deletar dependências de cada usuário
      for (const user of usersWithDependencies) {
        console.log(`📋 Processando dependências de ${user.name}:`);
        
        // 1. Deletar notificações
        if (user.notifications.length > 0) {
          const notifDeleted = await prisma.notification.deleteMany({
            where: { userId: user.id }
          });
          console.log(`   ✅ ${notifDeleted.count} notificações deletadas`);
        }
        
        // 2. Atualizar planos anuais atualizados (set updatedById to null)
        if (user.annualPlansUpdated.length > 0) {
          const plansUpdated = await prisma.annualPlan.updateMany({
            where: { updatedById: user.id },
            data: { updatedById: null }
          });
          console.log(`   ✅ ${plansUpdated.count} planos anuais desvinculados (updatedBy)`);
        }
        
        // 3. Para planos criados, precisamos deletá-los ou transferir para outro usuário
        if (user.annualPlansCreated.length > 0) {
          console.log(`   ⚠️ ATENÇÃO: ${user.annualPlansCreated.length} plano(s) anual(is) criado(s) por este usuário`);
          console.log(`      Estas serão DELETADAS pois o usuário criador será removido.`);
          
          const plansDeleted = await prisma.annualPlan.deleteMany({
            where: { createdById: user.id }
          });
          console.log(`   ✅ ${plansDeleted.count} planos anuais deletados`);
        }
      }
    }

    console.log('\n🗑️ INICIANDO DELEÇÃO DOS USUÁRIOS...\n');

    // Deletar os usuários
    const deletionResult = await prisma.user.deleteMany({
      where: {
        name: {
          in: usersToDelete
        }
      }
    });

    console.log(`✅ Deletados ${deletionResult.count} usuários com sucesso!`);

    // Verificação final
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const remainingUsers = await prisma.user.findMany({
      include: {
        department: { select: { name: true } }
      }
    });

    console.log(`   Total de usuários restantes: ${remainingUsers.length}\n`);
    
    remainingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      - Departamento: ${user.department?.name || 'Sem departamento'}`);
    });

    // Verificar se os usuários especificados ainda existem
    const stillExistingUsers = remainingUsers.filter(user => 
      usersToDelete.includes(user.name)
    );

    if (stillExistingUsers.length === 0) {
      console.log('\n✅ CONFIRMADO: Todos os usuários especificados foram removidos com sucesso!');
    } else {
      console.log('\n⚠️ ATENÇÃO: Alguns usuários ainda existem no banco:');
      stillExistingUsers.forEach(user => {
        console.log(`   - ${user.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao deletar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSpecificUsers();
