
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function deleteInactiveDepartments() {
  try {
    console.log('=== DELETANDO DEPARTAMENTOS INATIVOS ===\n');
    
    // Primeiro, verificar todos os departamentos
    console.log('📋 VERIFICANDO STATUS DOS DEPARTAMENTOS:\n');
    
    const allDepartments = await prisma.department.findMany({
      include: {
        type: { select: { name: true } },
        parent: { select: { name: true } },
        children: { select: { id: true, name: true, code: true } },
        users: { select: { id: true, name: true, email: true } },
        requests: { select: { id: true, requestNumber: true, status: true } },
        annualPlans: { select: { id: true, year: true, title: true } }
      }
    });

    console.log(`Total de departamentos: ${allDepartments.length}\n`);
    
    // Separar ativos e inativos
    const activeDepartments = allDepartments.filter(dept => dept.isActive);
    const inactiveDepartments = allDepartments.filter(dept => !dept.isActive);

    console.log(`✅ Departamentos ATIVOS: ${activeDepartments.length}`);
    activeDepartments.forEach((dept, index) => {
      console.log(`   ${index + 1}. ${dept.name} (${dept.code})`);
    });

    console.log(`\n❌ Departamentos INATIVOS: ${inactiveDepartments.length}`);
    
    if (inactiveDepartments.length === 0) {
      console.log('✅ Nenhum departamento inativo encontrado para deletar.');
      return;
    }

    // Mostrar departamentos inativos e suas dependências
    inactiveDepartments.forEach((dept, index) => {
      console.log(`\n   ${index + 1}. ${dept.name} (${dept.code})`);
      console.log(`      - Tipo: ${dept.type?.name || 'Sem tipo'}`);
      console.log(`      - Pai: ${dept.parent?.name || 'Raiz'}`);
      console.log(`      - Filhos: ${dept.children.length}`);
      console.log(`      - Usuários: ${dept.users.length}`);
      console.log(`      - Solicitações: ${dept.requests.length}`);
      console.log(`      - Planos Anuais: ${dept.annualPlans.length}`);
      
      if (dept.children.length > 0) {
        console.log('      ⚠️ DEPARTAMENTOS FILHOS:');
        dept.children.forEach((child, childIndex) => {
          console.log(`         ${childIndex + 1}. ${child.name} (${child.code})`);
        });
      }
      
      if (dept.users.length > 0) {
        console.log('      ⚠️ USUÁRIOS:');
        dept.users.forEach((user, userIndex) => {
          console.log(`         ${userIndex + 1}. ${user.name} (${user.email})`);
        });
      }
      
      if (dept.requests.length > 0) {
        console.log('      ⚠️ SOLICITAÇÕES:');
        dept.requests.forEach((req, reqIndex) => {
          console.log(`         ${reqIndex + 1}. ${req.requestNumber} (${req.status})`);
        });
      }
      
      if (dept.annualPlans.length > 0) {
        console.log('      ⚠️ PLANOS ANUAIS:');
        dept.annualPlans.forEach((plan, planIndex) => {
          console.log(`         ${planIndex + 1}. ${plan.year} - ${plan.title}`);
        });
      }
    });

    // Verificar se algum departamento inativo tem dependências
    const deptsWithDependencies = inactiveDepartments.filter(dept => 
      dept.children.length > 0 || 
      dept.users.length > 0 || 
      dept.requests.length > 0 ||
      dept.annualPlans.length > 0
    );

    if (deptsWithDependencies.length > 0) {
      console.log('\n⚠️ AVISO: Os seguintes departamentos inativos possuem dependências:');
      deptsWithDependencies.forEach(dept => {
        const deps = [];
        if (dept.children.length > 0) deps.push(`${dept.children.length} filho(s)`);
        if (dept.users.length > 0) deps.push(`${dept.users.length} usuário(s)`);
        if (dept.requests.length > 0) deps.push(`${dept.requests.length} solicitação(ões)`);
        if (dept.annualPlans.length > 0) deps.push(`${dept.annualPlans.length} plano(s) anual(is)`);
        console.log(`   - ${dept.name}: ${deps.join(', ')}`);
      });
      
      console.log('\n🗑️ TRATANDO DEPENDÊNCIAS PRIMEIRO...\n');
      
      // Tratar dependências de cada departamento inativo
      for (const dept of deptsWithDependencies) {
        console.log(`📋 Processando dependências de ${dept.name}:`);
        
        // 1. Deletar planos anuais
        if (dept.annualPlans.length > 0) {
          const plansDeleted = await prisma.annualPlan.deleteMany({
            where: { departmentId: dept.id }
          });
          console.log(`   ✅ ${plansDeleted.count} planos anuais deletados`);
        }
        
        // 2. Deletar solicitações (com seus itens e histórico)
        if (dept.requests.length > 0) {
          // Primeiro deletar itens das solicitações
          const requestIds = dept.requests.map(req => req.id);
          
          // Deletar histórico das solicitações
          const historyDeleted = await prisma.requestHistory.deleteMany({
            where: { requestId: { in: requestIds } }
          });
          console.log(`   ✅ ${historyDeleted.count} registros de histórico deletados`);
          
          // Deletar notificações das solicitações
          const notificationsDeleted = await prisma.notification.deleteMany({
            where: { requestId: { in: requestIds } }
          });
          console.log(`   ✅ ${notificationsDeleted.count} notificações deletadas`);
          
          // Deletar itens das solicitações
          const itemsDeleted = await prisma.requestItem.deleteMany({
            where: { requestId: { in: requestIds } }
          });
          console.log(`   ✅ ${itemsDeleted.count} itens de solicitações deletados`);
          
          // Finalmente deletar as solicitações
          const requestsDeleted = await prisma.request.deleteMany({
            where: { departmentId: dept.id }
          });
          console.log(`   ✅ ${requestsDeleted.count} solicitações deletadas`);
        }
        
        // 3. Mover usuários para um departamento ativo (ou deletá-los)
        if (dept.users.length > 0) {
          console.log(`   ⚠️ ATENÇÃO: ${dept.users.length} usuário(s) neste departamento inativo`);
          
          // Encontrar um departamento ativo para mover os usuários
          const activeDept = activeDepartments[0]; // Pegar o primeiro departamento ativo
          
          if (activeDept) {
            const usersUpdated = await prisma.user.updateMany({
              where: { departmentId: dept.id },
              data: { departmentId: activeDept.id }
            });
            console.log(`   ✅ ${usersUpdated.count} usuário(s) movido(s) para: ${activeDept.name}`);
          } else {
            console.log(`   ❌ ERRO: Não há departamentos ativos para mover os usuários!`);
            console.log(`   Para prosseguir, você deve ter pelo menos 1 departamento ativo.`);
            return;
          }
        }
        
        // 4. Atualizar departamentos filhos (remover a referência de pai)
        if (dept.children.length > 0) {
          const childrenUpdated = await prisma.department.updateMany({
            where: { parentId: dept.id },
            data: { parentId: null }
          });
          console.log(`   ✅ ${childrenUpdated.count} departamento(s) filho(s) desvinculado(s) (agora são raiz)`);
        }
      }
    }

    console.log('\n🗑️ INICIANDO DELEÇÃO DOS DEPARTAMENTOS INATIVOS...\n');

    // Deletar os departamentos inativos
    const departmentsToDelete = inactiveDepartments.map(dept => dept.id);
    
    const deletionResult = await prisma.department.deleteMany({
      where: {
        id: { in: departmentsToDelete }
      }
    });

    console.log(`✅ Deletados ${deletionResult.count} departamentos inativos com sucesso!`);

    // Verificação final
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const remainingDepartments = await prisma.department.findMany({
      include: {
        type: { select: { name: true } },
        parent: { select: { name: true } }
      }
    });

    console.log(`   Total de departamentos restantes: ${remainingDepartments.length}\n`);
    
    const activeRemaining = remainingDepartments.filter(dept => dept.isActive);
    const inactiveRemaining = remainingDepartments.filter(dept => !dept.isActive);
    
    console.log(`✅ Departamentos ATIVOS restantes: ${activeRemaining.length}`);
    activeRemaining.forEach((dept, index) => {
      console.log(`   ${index + 1}. ${dept.name} (${dept.code})`);
    });
    
    if (inactiveRemaining.length > 0) {
      console.log(`\n❌ Departamentos INATIVOS restantes: ${inactiveRemaining.length}`);
      inactiveRemaining.forEach((dept, index) => {
        console.log(`   ${index + 1}. ${dept.name} (${dept.code})`);
      });
      console.log('   ⚠️ Alguns departamentos inativos ainda existem - pode ter havido erro na deleção');
    } else {
      console.log('\n✅ CONFIRMADO: Todos os departamentos inativos foram removidos com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao deletar departamentos inativos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteInactiveDepartments();
