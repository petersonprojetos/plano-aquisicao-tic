

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: { id: true, code: true, name: true }
        },
        type: {
          select: { id: true, code: true, name: true }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao buscar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code, name, description, categoryId, typeId, specifications, isActive } = body

    if (!code || !name || !categoryId || !typeId) {
      return NextResponse.json(
        { error: 'Código, nome, categoria e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se existe
    const existingItem = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar duplicata de código
    const duplicateItem = await prisma.item.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          { code: code }
        ]
      }
    })

    if (duplicateItem) {
      return NextResponse.json(
        { error: 'Código já existe em outro item' },
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

    const item = await prisma.item.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        name,
        description,
        categoryId,
        typeId,
        specifications,
        isActive
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

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se existe
    const existingItem = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Aqui poderia verificar se o item está sendo usado em alguma solicitação
    // mas por enquanto vamos permitir a exclusão

    await prisma.item.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
