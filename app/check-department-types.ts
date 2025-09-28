
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function checkAndCreateDepartmentTypes() {
  try {
    console.log('🔍 Verificando tipos de departamento...')

    const count = await prisma.departmentType.count()
    console.log(`Tipos de departamento encontrados: ${count}`)

    if (count === 0) {
      console.log('🌱 Criando tipos de departamento padrão...')
      
      const defaultTypes = [
        { code: 'ADMIN', name: 'Administração' },
        { code: 'TIC', name: 'Tecnologia da Informação' },
        { code: 'RH', name: 'Recursos Humanos' },
        { code: 'FIN', name: 'Financeiro' },
        { code: 'OP', name: 'Operacional' },
        { code: 'LOG', name: 'Logística' }
      ]

      for (const type of defaultTypes) {
        await prisma.departmentType.create({
          data: {
            code: type.code,
            name: type.name,
            isActive: true
          }
        })
        console.log(`✅ Tipo criado: ${type.code} - ${type.name}`)
      }
    }

    const types = await prisma.departmentType.findMany({
      include: {
        _count: {
          select: { departments: true }
        }
      }
    })

    console.log('\n📋 Tipos de departamento:')
    types.forEach(type => {
      console.log(`- ${type.code}: ${type.name} (${type._count.departments} departamentos)`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateDepartmentTypes()
