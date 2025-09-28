
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const prisma = new PrismaClient()

interface ItemData {
  CODIGO: string
  ITEM: string
  DESCRICAO: string
  GRUPO: string
  CATEGORIA: string
}

async function importItems() {
  try {
    console.log('🚀 Iniciando importação de itens...')
    
    // Ler o arquivo Excel
    const filePath = path.join(process.cwd(), '..', '..', 'Uploads', 'taxonomia_itens_tic.xlsx')
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data: ItemData[] = XLSX.utils.sheet_to_json(worksheet)

    console.log(`📊 Encontrados ${data.length} itens para importar`)

    // Buscar itens existentes
    const existingItems = await prisma.item.findMany({
      select: { code: true, name: true }
    })
    
    const existingCodes = new Set(existingItems.map(i => i.code))
    const existingNames = new Set(existingItems.map(i => i.name))

    // Buscar todas as categorias e tipos para fazer o mapeamento
    const categories = await prisma.itemCategoryMaster.findMany({
      select: { id: true, name: true }
    })
    
    const types = await prisma.itemTypeMaster.findMany({
      select: { id: true, name: true }
    })

    // Criar mapas de nome -> ID
    const categoryMap = new Map<string, string>()
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id)
    })

    // Criar mapeamento especial para categorias (nome curto -> ID)
    const categoryShortNameMap = new Map<string, string>()
    const categoryMappings = [
      { short: 'Materiais e Equipamentos de TIC', full: 'MATERIAIS E EQUIPAMENTOS DE TIC (MEQT)' },
      { short: 'Desenvolvimento e Sustentação de Sistemas', full: 'DESENVOLVIMENTO E SUSTENTAÇÃO DE SISTEMAS (DVSS)' },
      { short: 'Hospedagem de Sistemas', full: 'HOSPEDAGEM DE SISTEMAS (HSPD)' },
      { short: 'Suporte e Atendimento a Usuário de TIC', full: 'SUPORTE E ATENDIMENTO A USUÁRIO DE TIC (SUAT)' },
      { short: 'Infraestrutura de TIC', full: 'INFRAESTRUTURA DE TIC (INFT)' },
      { short: 'Comunicação de Dados', full: 'COMUNICAÇÃO DE DADOS (CMDD)' },
      { short: 'Software e Aplicativos', full: 'SOFTWARE E APLICATIVOS (SFTW)' },
      { short: 'Impressão e Digitalização', full: 'IMPRESSÃO E DIGITALIZAÇÃO (IMDG)' },
      { short: 'Consultoria em TIC', full: 'CONSULTORIA EM TIC (COTI)' },
      { short: 'Computação em Nuvem', full: 'COMPUTAÇÃO EM NUVEM (CNUV)' },
      { short: 'Internet das Coisas — IoT', full: 'INTERNET DAS COISAS — IoT (IOTI)' },
      { short: 'Segurança da Informação e Privacidade', full: 'SEGURANÇA DA INFORMAÇÃO E PRIVACIDADE (SIPP)' },
      { short: 'Análise de Dados, ML e IA', full: 'ANÁLISE DE DADOS, ML E IA (ADAI)' }
    ]

    categoryMappings.forEach(mapping => {
      const categoryId = categoryMap.get(mapping.full)
      if (categoryId) {
        categoryShortNameMap.set(mapping.short, categoryId)
      }
    })

    const typeMap = new Map<string, string>()
    types.forEach(type => {
      typeMap.set(type.name, type.id)
    })

    console.log(`📋 Categorias disponíveis: ${categories.length}`)
    console.log(`📋 Tipos disponíveis: ${types.length}`)

    let imported = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      try {
        // Limpar e validar dados
        const code = String(row.CODIGO).trim()
        const name = String(row.ITEM).trim()
        const description = row.DESCRICAO ? String(row.DESCRICAO).trim() : null
        const groupName = String(row.GRUPO).trim()
        const categoryName = String(row.CATEGORIA).trim()

        if (!code || !name) {
          console.log(`❌ Linha ${i + 1} inválida: código ou nome vazio - ${JSON.stringify(row)}`)
          errors++
          continue
        }

        // Verificar se já existe
        if (existingCodes.has(code)) {
          console.log(`⏭️  Item já existe (código): ${code} - ${name}`)
          skipped++
          continue
        }

        if (existingNames.has(name)) {
          console.log(`⏭️  Item já existe (nome): ${name}`)
          skipped++
          continue
        }

        // Buscar categoria por nome (primeiro tenta o nome curto, depois o completo)
        let categoryId = categoryShortNameMap.get(categoryName) || categoryMap.get(categoryName)
        if (!categoryId) {
          console.log(`❌ Categoria não encontrada: "${categoryName}" para item ${code}`)
          console.log(`   Categorias disponíveis: ${Array.from(categoryShortNameMap.keys()).slice(0, 3).join(', ')}...`)
          errors++
          continue
        }

        // Buscar tipo por nome
        const typeId = typeMap.get(groupName)
        if (!typeId) {
          console.log(`❌ Tipo/Grupo não encontrado: "${groupName}" para item ${code}`)
          errors++
          continue
        }

        // Criar item
        await prisma.item.create({
          data: {
            code,
            name,
            description,
            categoryId,
            typeId,
            isActive: true
          }
        })

        console.log(`✅ Item criado: ${code} - ${name}`)
        imported++

        // Adicionar aos existentes para próximas validações
        existingCodes.add(code)
        existingNames.add(name)

      } catch (error: any) {
        console.log(`❌ Erro ao processar item linha ${i + 1}: ${error.message}`)
        errors++
      }
    }

    console.log('\n=== RELATÓRIO DE IMPORTAÇÃO DE ITENS ===')
    console.log(`📊 Total de linhas processadas: ${data.length}`)
    console.log(`✅ Itens importados: ${imported}`)
    console.log(`⏭️  Itens já existentes: ${skipped}`)
    console.log(`❌ Erros: ${errors}`)

    if (errors > 0) {
      console.log('\n=== DICA PARA RESOLUÇÃO DE ERROS ===')
      console.log('Se houver erros de categoria ou tipo não encontrado:')
      console.log('1. Verifique se as categorias foram importadas corretamente')
      console.log('2. Verifique se os tipos foram importados corretamente')
      console.log('3. Compare os nomes no arquivo Excel com os nomes no banco')
    }

  } catch (error) {
    console.error('❌ Erro geral na importação de itens:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  importItems()
    .then(() => {
      console.log('🎉 Importação de itens concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na importação de itens:', error)
      process.exit(1)
    })
}

export { importItems }
