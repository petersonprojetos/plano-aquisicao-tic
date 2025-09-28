
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const prisma = new PrismaClient()

interface CategoryData {
  CODIGO: string
  CATEGORIA: string
  DESCRICAO: string
}

async function importCategories() {
  try {
    console.log('🚀 Iniciando importação de categorias...')
    
    // Ler o arquivo Excel
    const filePath = path.join(process.cwd(), '..', '..', 'Uploads', 'taxonomia_categorias_tic.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: CategoryData[] = XLSX.utils.sheet_to_json(worksheet)

    console.log(`📊 Encontradas ${data.length} categorias para importar`)

    // Buscar categorias existentes
    const existingCategories = await prisma.itemCategoryMaster.findMany({
      select: { code: true, name: true }
    })
    
    const existingCodes = new Set(existingCategories.map(c => c.code))
    const existingNames = new Set(existingCategories.map(c => c.name))

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const row of data) {
      try {
        // Limpar e validar dados
        const code = String(row.CODIGO).trim()
        const name = String(row.CATEGORIA).trim()
        const description = row.DESCRICAO ? String(row.DESCRICAO).trim() : null

        if (!code || !name) {
          console.log(`❌ Linha inválida: código ou nome vazio - ${JSON.stringify(row)}`)
          errors++
          continue
        }

        // Verificar se já existe
        if (existingCodes.has(code)) {
          console.log(`⏭️  Categoria já existe (código): ${code} - ${name}`)
          skipped++
          continue
        }

        if (existingNames.has(name)) {
          console.log(`⏭️  Categoria já existe (nome): ${name}`)
          skipped++
          continue
        }

        // Criar categoria
        await prisma.itemCategoryMaster.create({
          data: {
            code,
            name,
            description,
            isActive: true
          }
        })

        console.log(`✅ Categoria criada: ${code} - ${name}`)
        imported++

        // Adicionar aos existentes para próximas validações
        existingCodes.add(code)
        existingNames.add(name)

      } catch (error: any) {
        console.log(`❌ Erro ao processar categoria ${row.CODIGO}: ${error.message}`)
        errors++
      }
    }

    console.log('\n=== RELATÓRIO DE IMPORTAÇÃO DE CATEGORIAS ===')
    console.log(`📊 Total de linhas processadas: ${data.length}`)
    console.log(`✅ Categorias importadas: ${imported}`)
    console.log(`⏭️  Categorias já existentes: ${skipped}`)
    console.log(`❌ Erros: ${errors}`)

  } catch (error) {
    console.error('❌ Erro geral na importação de categorias:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  importCategories()
    .then(() => {
      console.log('🎉 Importação de categorias concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na importação de categorias:', error)
      process.exit(1)
    })
}

export { importCategories }
