

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

    const category = await prisma.itemCategoryMaster.findUnique({
      where: { id: params.id },
      include: {
        items: {
          select: { id: true, code: true, description: true, isActive: true }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
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
    const { code, name, description, isActive } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Código e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se existe
    const existingCategory = await prisma.itemCategoryMaster.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar duplicatas
    const duplicateCategory = await prisma.itemCategoryMaster.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { code: code },
              { name: name }
            ]
          }
        ]
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Código ou nome já existe em outra categoria' },
        { status: 409 }
      )
    }

    const category = await prisma.itemCategoryMaster.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        name,
        description,
        isActive
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
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
    const existingCategory = await prisma.itemCategoryMaster.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se tem itens vinculados
    if (existingCategory._count.items > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir categoria com itens vinculados' },
        { status: 400 }
      )
    }

    await prisma.itemCategoryMaster.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
