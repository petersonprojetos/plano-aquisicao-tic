
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function restoreCleanState() {
  try {
    console.log('🧹 Iniciando limpeza completa do banco...\n')

    // 1. Deletar todas as solicitações
    const deletedRequests = await prisma.request.deleteMany({})
    console.log(`📝 Solicitações deletadas: ${deletedRequests.count}`)

    // 2. Deletar todos os itens
    const deletedItems = await prisma.item.deleteMany({})
    console.log(`📦 Itens deletados: ${deletedItems.count}`)

    // 3. Deletar todos os tipos de item
    const deletedItemTypes = await prisma.itemTypeMaster.deleteMany({})
    console.log(`📋 Tipos de item deletados: ${deletedItemTypes.count}`)

    // 4. Deletar todos os planos anuais (dependência dos usuários)
    const deletedAnnualPlans = await prisma.annualPlan.deleteMany({})
    console.log(`📅 Planos anuais deletados: ${deletedAnnualPlans.count}`)

    // 5. Encontrar departamento TI
    const tiDept = await prisma.department.findFirst({
      where: { code: 'TI' }
    })

    if (!tiDept) {
      throw new Error('Departamento TI não encontrado!')
    }

    // 6. Deletar usuários que não sejam do TI
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        departmentId: {
          not: tiDept.id
        }
      }
    })
    console.log(`👥 Usuários de outros departamentos deletados: ${deletedUsers.count}`)

    // 7. Deletar departamentos que não sejam TI
    const deletedDepartments = await prisma.department.deleteMany({
      where: {
        code: {
          not: 'TI'
        }
      }
    })
    console.log(`🏢 Departamentos deletados (exceto TI): ${deletedDepartments.count}`)

    // 6. Verificar estado final
    console.log('\n✅ Limpeza concluída! Estado atual:')
    
    const finalDeptCount = await prisma.department.count()
    const finalUserCount = await prisma.user.count()
    const finalItemTypeCount = await prisma.itemTypeMaster.count()
    const finalItemCount = await prisma.item.count()
    const finalRequestCount = await prisma.request.count()

    console.log(`📊 Departamentos: ${finalDeptCount}`)
    console.log(`👥 Usuários: ${finalUserCount}`)
    console.log(`📋 Tipos de Item: ${finalItemTypeCount}`)
    console.log(`📦 Itens: ${finalItemCount}`)
    console.log(`📝 Solicitações: ${finalRequestCount}`)

    // Mostrar departamento restante
    const remainingDept = await prisma.department.findFirst({
      select: {
        code: true,
        name: true,
        isActive: true
      }
    })
    
    if (remainingDept) {
      console.log(`\n🏢 Departamento restante: ${remainingDept.code} - ${remainingDept.name} (${remainingDept.isActive ? 'ativo' : 'inativo'})`)
    }

    console.log('\n🎯 Estado restaurado com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

restoreCleanState()
