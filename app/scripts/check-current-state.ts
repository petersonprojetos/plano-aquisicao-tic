
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCurrentState() {
  try {
    console.log('=== ESTADO ATUAL DO BANCO DE DADOS ===\n')

    // Contar departamentos
    const departmentCount = await prisma.department.count()
    console.log(`📊 Departamentos: ${departmentCount}`)
    
    if (departmentCount > 0) {
      const departments = await prisma.department.findMany({
        select: {
          code: true,
          name: true,
          sigla_departamento: true,
          isActive: true
        }
      })
      departments.forEach(dept => {
        console.log(`  - ${dept.code} - ${dept.name} (${dept.sigla_departamento || 'sem sigla'}) - ${dept.isActive ? 'ativo' : 'inativo'}`)
      })
    }

    // Contar usuários
    const userCount = await prisma.user.count()
    console.log(`\n👥 Usuários: ${userCount}`)

    // Contar tipos de item
    const itemTypeCount = await prisma.itemTypeMaster.count()
    console.log(`📋 Tipos de Item: ${itemTypeCount}`)

    // Contar itens
    const itemCount = await prisma.item.count()
    console.log(`📦 Itens: ${itemCount}`)

    // Contar solicitações
    const requestCount = await prisma.request.count()
    console.log(`📝 Solicitações: ${requestCount}`)

    console.log('\n=== FIM DO RELATÓRIO ===')

  } catch (error) {
    console.error('❌ Erro ao verificar estado:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentState()
