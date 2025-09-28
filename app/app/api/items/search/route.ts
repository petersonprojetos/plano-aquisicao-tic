
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Força renderização dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    // Só busca se tiver pelo menos 4 caracteres
    if (query.length < 4) {
      return NextResponse.json({ items: [], exclusions: [] })
    }
    
    // Busca nos itens ativos
    const items = await prisma.item.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        categoryId: true,
        typeId: true,
        category: {
          select: { 
            id: true,
            code: true,
            name: true 
          }
        },
        type: {
          select: { 
            id: true,
            code: true,
            name: true 
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: 10 // Limita a 10 resultados
    })

    // Busca nas exclusões para verificar se o termo digitado corresponde a algum item excluído
    const exclusions = await prisma.itemExclusion.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        justification: true
      },
      take: 5
    })

    return NextResponse.json({ items, exclusions })
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
