
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const prisma = new PrismaClient()

async function verifyImports() {
  try {
    console.log('🔍 Verificando importações realizadas...\n')

    // Buscar categorias
    const categories = await prisma.itemCategoryMaster.findMany({
      orderBy: { code: 'asc' }
    })

    // Buscar tipos
    const types = await prisma.itemTypeMaster.findMany({
      orderBy: { code: 'asc' }
    })

    // Buscar itens com relacionamentos
    const items = await prisma.item.findMany({
      include: {
        category: true,
        type: true
      },
      orderBy: { code: 'asc' }
    })

    console.log('=== RESUMO DAS IMPORTAÇÕES ===')
    console.log(`📋 Categorias importadas: ${categories.length}`)
    console.log(`🏷️  Tipos importados: ${types.length}`)
    console.log(`📦 Itens importados: ${items.length}`)
    console.log()

    console.log('=== CATEGORIAS IMPORTADAS ===')
    categories.forEach(cat => {
      console.log(`  ${cat.code} - ${cat.name}`)
    })
    console.log()

    console.log('=== TIPOS IMPORTADOS (primeiros 10) ===')
    types.slice(0, 10).forEach(type => {
      console.log(`  ${type.code} - ${type.name}`)
    })
    if (types.length > 10) {
      console.log(`  ... e mais ${types.length - 10} tipos`)
    }
    console.log()

    console.log('=== ITENS IMPORTADOS (primeiros 10) ===')
    items.slice(0, 10).forEach(item => {
      console.log(`  ${item.code} - ${item.name}`)
      console.log(`    Categoria: ${item.category.name}`)
      console.log(`    Tipo: ${item.type.name}`)
      console.log()
    })
    if (items.length > 10) {
      console.log(`  ... e mais ${items.length - 10} itens`)
    }

    // Estatísticas por categoria
    console.log('=== DISTRIBUIÇÃO POR CATEGORIA ===')
    const categoryStats = new Map<string, number>()
    items.forEach(item => {
      const categoryName = item.category.name
      categoryStats.set(categoryName, (categoryStats.get(categoryName) || 0) + 1)
    })

    Array.from(categoryStats.entries())
      .sort(([,a], [,b]) => b - a)
      .forEach(([categoryName, count]) => {
        console.log(`  ${categoryName}: ${count} itens`)
      })

    console.log('\n🎉 Verificação concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro na verificação:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verifyImports()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na verificação:', error)
      process.exit(1)
    })
}

export { verifyImports }
