
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const prisma = new PrismaClient()

interface TypeData {
  GRUPO: string
  DESCRICAO: string
}

async function importTypes() {
  try {
    console.log('🚀 Iniciando importação de tipos/grupos...')
    
    // Ler o arquivo Excel
    const filePath = path.join(process.cwd(), '..', '..', 'Uploads', 'taxonomia_grupos_tic.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: TypeData[] = XLSX.utils.sheet_to_json(worksheet)

    console.log(`📊 Encontrados ${data.length} tipos para importar`)

    // Buscar tipos existentes
    const existingTypes = await prisma.itemTypeMaster.findMany({
      select: { name: true }
    })
    
    const existingNames = new Set(existingTypes.map(t => t.name))

    let imported = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      try {
        // Limpar e validar dados
        const name = String(row.GRUPO).trim()
        const description = row.DESCRICAO ? String(row.DESCRICAO).trim() : null

        if (!name) {
          console.log(`❌ Linha ${i + 1} inválida: nome do grupo vazio - ${JSON.stringify(row)}`)
          errors++
          continue
        }

        // Verificar se já existe
        if (existingNames.has(name)) {
          console.log(`⏭️  Tipo já existe: ${name}`)
          skipped++
          continue
        }

        // Gerar código único (TPO + número sequencial com 3 dígitos)
        const code = `TPO${String(i + 1).padStart(3, '0')}`

        // Criar tipo
        await prisma.itemTypeMaster.create({
          data: {
            code,
            name,
            description,
            isActive: true
          }
        })

        console.log(`✅ Tipo criado: ${code} - ${name}`)
        imported++

        // Adicionar aos existentes para próximas validações
        existingNames.add(name)

      } catch (error: any) {
        console.log(`❌ Erro ao processar tipo linha ${i + 1}: ${error.message}`)
        errors++
      }
    }

    console.log('\n=== RELATÓRIO DE IMPORTAÇÃO DE TIPOS ===')
    console.log(`📊 Total de linhas processadas: ${data.length}`)
    console.log(`✅ Tipos importados: ${imported}`)
    console.log(`⏭️  Tipos já existentes: ${skipped}`)
    console.log(`❌ Erros: ${errors}`)

  } catch (error) {
    console.error('❌ Erro geral na importação de tipos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  importTypes()
    .then(() => {
      console.log('🎉 Importação de tipos concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na importação de tipos:', error)
      process.exit(1)
    })
}

export { importTypes }
