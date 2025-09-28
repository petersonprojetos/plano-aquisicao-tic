
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('\n🧹 INICIANDO LIMPEZA COMPLETA DO BANCO\n')
    
    // 1. Deletar todas as solicitações e dependências
    console.log('1. Deletando solicitações e dependências...')
    
    // Deletar notificações das solicitações
    const notificationsDeleted = await prisma.notification.deleteMany({})
    console.log(`   ✓ ${notificationsDeleted.count} notificações deletadas`)
    
    // Deletar histórico de solicitações
    const historyDeleted = await prisma.requestHistory.deleteMany({})
    console.log(`   ✓ ${historyDeleted.count} registros de histórico deletados`)
    
    // Deletar itens das solicitações
    const requestItemsDeleted = await prisma.requestItem.deleteMany({})
    console.log(`   ✓ ${requestItemsDeleted.count} itens de solicitação deletados`)
    
    // Deletar solicitações
    const requestsDeleted = await prisma.request.deleteMany({})
    console.log(`   ✓ ${requestsDeleted.count} solicitações deletadas`)
    
    // 2. Deletar todos os itens
    console.log('\n2. Deletando todos os itens...')
    const itemsDeleted = await prisma.item.deleteMany({})
    console.log(`   ✓ ${itemsDeleted.count} itens deletados`)
    
    // 3. Deletar todos os tipos de item
    console.log('\n3. Deletando todos os tipos de item...')
    const itemTypesDeleted = await prisma.itemTypeMaster.deleteMany({})
    console.log(`   ✓ ${itemTypesDeleted.count} tipos de item deletados`)
    
    // 4. Deletar categorias de item (se existirem)
    console.log('\n4. Deletando todas as categorias de item...')
    const itemCategoriesDeleted = await prisma.itemCategoryMaster.deleteMany({})
    console.log(`   ✓ ${itemCategoriesDeleted.count} categorias de item deletadas`)
    
    // 5. Deletar planos anuais
    console.log('\n5. Deletando planos anuais...')
    const annualPlansDeleted = await prisma.annualPlan.deleteMany({})
    console.log(`   ✓ ${annualPlansDeleted.count} planos anuais deletados`)
    
    // 6. Listar departamentos antes da limpeza
    console.log('\n6. Verificando departamentos...')
    const allDepartments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        _count: {
          select: { users: true }
        }
      }
    })
    
    console.log('   Departamentos encontrados:')
    allDepartments.forEach(dept => 
      console.log(`   - ${dept.name} (${dept.code}) - ${dept.isActive ? 'ATIVO' : 'INATIVO'} - ${dept._count.users} usuários`)
    )
    
    // Deletar departamentos que NÃO sejam TI
    const departmentsToDelete = allDepartments.filter(dept => dept.code !== 'TI')
    
    if (departmentsToDelete.length > 0) {
      console.log('\n   Deletando departamentos não-TI:')
      for (const dept of departmentsToDelete) {
        // Primeiro, deletar usuários do departamento (se houver)
        const usersToDelete = await prisma.user.deleteMany({
          where: { departmentId: dept.id }
        })
        if (usersToDelete.count > 0) {
          console.log(`   - Deletados ${usersToDelete.count} usuários do dept ${dept.name}`)
        }
        
        // Depois deletar o departamento
        await prisma.department.delete({
          where: { id: dept.id }
        })
        console.log(`   ✓ Departamento ${dept.name} (${dept.code}) deletado`)
      }
    }
    
    // 7. Verificar usuários restantes
    console.log('\n7. Verificando usuários restantes...')
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: {
          select: { name: true, code: true }
        }
      }
    })
    
    console.log(`   Usuários restantes: ${remainingUsers.length}`)
    remainingUsers.forEach(user => 
      console.log(`   - ${user.name} (${user.email}) - Dept: ${user.department?.name || 'N/A'}`)
    )
    
    console.log('\n✅ LIMPEZA COMPLETA CONCLUÍDA!')
    console.log('\n📊 ESTADO FINAL:')
    console.log(`   - Departamentos: ${allDepartments.filter(d => d.code === 'TI').length} (apenas TI)`)
    console.log(`   - Usuários: ${remainingUsers.length}`)
    console.log(`   - Tipos de Item: 0`)
    console.log(`   - Itens: 0`) 
    console.log(`   - Solicitações: 0`)
    console.log('\n🎯 ESTE É AGORA O ESTADO INICIAL DO SISTEMA')
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
