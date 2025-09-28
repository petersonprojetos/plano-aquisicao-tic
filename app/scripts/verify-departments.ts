
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('=== VERIFICAÇÃO DOS DEPARTAMENTOS IMPORTADOS ===\n')
    
    // Contar total de departamentos
    const totalDepartments = await prisma.department.count()
    console.log(`Total de departamentos no banco: ${totalDepartments}`)
    
    // Mostrar alguns departamentos raiz
    const rootDepartments = await prisma.department.findMany({
      where: { parentId: null },
      take: 10,
      select: {
        code: true,
        name: true,
        city: true,
        state: true,
        commander: true,
        phone: true
      }
    })
    
    console.log(`\n=== PRIMEIROS 10 DEPARTAMENTOS RAIZ ===`)
    rootDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.code} - ${dept.name}`)
      console.log(`   Cidade: ${dept.city}/${dept.state}`)
      console.log(`   Comandante: ${dept.commander}`)
      console.log(`   Telefone: ${dept.phone}`)
      console.log('')
    })
    
    // Verificar hierarquia - mostrar alguns departamentos com seus pais
    const departmentsWithParent = await prisma.department.findMany({
      where: { parentId: { not: null } },
      take: 5,
      include: {
        parent: {
          select: { code: true, name: true }
        }
      }
    })
    
    console.log(`=== ALGUNS DEPARTAMENTOS COM HIERARQUIA ===`)
    departmentsWithParent.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.code} - ${dept.name}`)
      console.log(`   Cidade: ${dept.city}`)
      if (dept.parent) {
        console.log(`   Pai: ${dept.parent.code} - ${dept.parent.name}`)
      }
      console.log('')
    })
    
    // Verificar por códigos específicos da planilha
    const specificDepartments = await prisma.department.findMany({
      where: {
        code: {
          in: ['PM-BA', 'CG', 'SCG', 'APM', 'BOPE']
        }
      },
      include: {
        parent: {
          select: { code: true, name: true }
        },
        children: {
          select: { code: true, name: true },
          take: 3
        }
      }
    })
    
    console.log(`=== DEPARTAMENTOS ESPECÍFICOS DA PLANILHA ===`)
    specificDepartments.forEach((dept) => {
      console.log(`${dept.code} - ${dept.name}`)
      console.log(`  Estado: ${dept.state}`)
      console.log(`  Cidade: ${dept.city}`)
      console.log(`  Orçamento Anual: R$ ${dept.annualBudget?.toString()}`)
      if (dept.parent) {
        console.log(`  Departamento Pai: ${dept.parent.code} - ${dept.parent.name}`)
      }
      if (dept.children && dept.children.length > 0) {
        console.log(`  Primeiros filhos: ${dept.children.map(child => child.code).join(', ')}`)
      }
      console.log('')
    })
    
    // Estatísticas finais
    const stats = await prisma.department.groupBy({
      by: ['state'],
      _count: {
        id: true
      }
    })
    
    console.log(`=== ESTATÍSTICAS POR ESTADO ===`)
    stats.forEach(stat => {
      console.log(`${stat.state}: ${stat._count.id} departamentos`)
    })
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
