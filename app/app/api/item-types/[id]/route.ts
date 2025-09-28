

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

    const type = await prisma.itemTypeMaster.findUnique({
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

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(type)
  } catch (error) {
    console.error('Erro ao buscar tipo:', error)
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
    const existingType = await prisma.itemTypeMaster.findUnique({
      where: { id: params.id }
    })

    if (!existingType) {
      return NextResponse.json(
        { error: 'Tipo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar duplicatas
    const duplicateType = await prisma.itemTypeMaster.findFirst({
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

    if (duplicateType) {
      return NextResponse.json(
        { error: 'Código ou nome já existe em outro tipo' },
        { status: 409 }
      )
    }

    const type = await prisma.itemTypeMaster.update({
      where: { id: params.id },
      data: {
        code: code.toUpperCase(),
        name,
        description,
        isActive
      }
    })

    return NextResponse.json(type)
  } catch (error) {
    console.error('Erro ao atualizar tipo:', error)
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
    const existingType = await prisma.itemTypeMaster.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })

    if (!existingType) {
      return NextResponse.json(
        { error: 'Tipo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se tem itens vinculados
    if (existingType._count.items > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir tipo com itens vinculados' },
        { status: 400 }
      )
    }

    await prisma.itemTypeMaster.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Tipo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tipo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
