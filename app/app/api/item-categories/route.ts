

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const categories = await prisma.itemCategoryMaster.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code, name, description } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Código e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe
    const existingCategory = await prisma.itemCategoryMaster.findFirst({
      where: {
        OR: [
          { code: code },
          { name: name }
        ]
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Código ou nome já existe' },
        { status: 409 }
      )
    }

    const category = await prisma.itemCategoryMaster.create({
      data: {
        code: code.toUpperCase(),
        name,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
