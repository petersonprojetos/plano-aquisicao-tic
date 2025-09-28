
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const departmentTypes = [
  {
    code: 'ADM',
    name: 'Administrativo',
    observations: 'Departamentos responsáveis pela gestão administrativa e suporte organizacional'
  },
  {
    code: 'OPE',
    name: 'Operacional',
    observations: 'Departamentos envolvidos na execução das atividades operacionais da organização'
  },
  {
    code: 'ESP',
    name: 'Especializada',
    observations: 'Departamentos que desempenham funções especializadas e técnicas'
  },
  {
    code: 'ENS',
    name: 'Ensino',
    observations: 'Departamentos relacionados à educação e formação profissional'
  },
  {
    code: 'RES',
    name: 'Reserva E Outros',
    observations: 'Departamentos de reserva e outras categorias não especificadas'
  }
]

async function createDepartmentTypes() {
  console.log('🚀 Iniciando criação dos tipos de departamento...')

  try {
    for (const deptType of departmentTypes) {
      // Verificar se já existe
      const existing = await prisma.departmentType.findUnique({
        where: { code: deptType.code }
      })

      if (existing) {
        console.log(`⚠️  Tipo ${deptType.code} - ${deptType.name} já existe, pulando...`)
      } else {
        await prisma.departmentType.create({
          data: deptType
        })
        console.log(`✅ Criado tipo: ${deptType.code} - ${deptType.name}`)
      }
    }

    console.log('\n📊 Verificando tipos criados:')
    const allTypes = await prisma.departmentType.findMany({
      orderBy: { code: 'asc' }
    })

    console.log(`Total de tipos de departamento: ${allTypes.length}`)
    allTypes.forEach(type => {
      console.log(`- ${type.code}: ${type.name}`)
    })

    console.log('\n✅ Processo concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar tipos de departamento:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createDepartmentTypes()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
