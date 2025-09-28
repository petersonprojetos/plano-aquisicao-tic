

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
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const typeId = searchParams.get('typeId')
    
    const items = await prisma.item.findMany({
      where: {
        AND: [
          includeInactive ? {} : { isActive: true },
          search ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          categoryId ? { categoryId } : {},
          typeId ? { typeId } : {}
        ]
      },
      include: {
        category: {
          select: { id: true, code: true, name: true }
        },
        type: {
          select: { id: true, code: true, name: true }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
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
    const { code, name, description, categoryId, typeId, specifications } = body

    if (!code || !name || !categoryId || !typeId) {
      return NextResponse.json(
        { error: 'Código, nome, categoria e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se código já existe
    const existingItem = await prisma.item.findUnique({
      where: { code: code }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Código já existe' },
        { status: 409 }
      )
    }

    // Verificar se categoria existe
    const categoryExists = await prisma.itemCategoryMaster.findUnique({
      where: { id: categoryId, isActive: true }
    })

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Categoria não encontrada ou inativa' },
        { status: 400 }
      )
    }

    // Verificar se tipo existe
    const typeExists = await prisma.itemTypeMaster.findUnique({
      where: { id: typeId, isActive: true }
    })

    if (!typeExists) {
      return NextResponse.json(
        { error: 'Tipo não encontrado ou inativo' },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        categoryId,
        typeId,
        specifications
      },
      include: {
        category: {
          select: { id: true, code: true, name: true }
        },
        type: {
          select: { id: true, code: true, name: true }
        }
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
