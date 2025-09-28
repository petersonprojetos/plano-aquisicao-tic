
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const acquisitionType = await prisma.acquisitionTypeMaster.findUnique({
      where: { id: params.id }
    })

    if (!acquisitionType) {
      return NextResponse.json(
        { error: 'Tipo de aquisição não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(acquisitionType)
  } catch (error) {
    console.error('Erro ao buscar tipo de aquisição:', error)
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
        { error: 'Acesso negado. Apenas administradores podem editar tipos de aquisição.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validação dos campos obrigatórios
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: 'Código e nome do tipo de aquisição são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já existe outro tipo de aquisição com o mesmo código ou nome
    const existingAcquisitionType = await prisma.acquisitionTypeMaster.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { code: body.code },
              { name: body.name }
            ]
          }
        ]
      }
    })

    if (existingAcquisitionType) {
      return NextResponse.json(
        { error: 'Já existe outro tipo de aquisição com este código ou nome' },
        { status: 409 }
      )
    }

    const acquisitionType = await prisma.acquisitionTypeMaster.update({
      where: { id: params.id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json(acquisitionType)
  } catch (error) {
    console.error('Erro ao atualizar tipo de aquisição:', error)
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
        { error: 'Acesso negado. Apenas administradores podem excluir tipos de aquisição.' },
        { status: 403 }
      )
    }

    // Verifica se o tipo de aquisição existe
    const acquisitionType = await prisma.acquisitionTypeMaster.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { requestItems: true }
        }
      }
    })

    if (!acquisitionType) {
      return NextResponse.json(
        { error: 'Tipo de aquisição não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se há itens de solicitação vinculados
    if (acquisitionType._count.requestItems > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir este tipo de aquisição pois existem solicitações vinculadas a ele.' },
        { status: 400 }
      )
    }

    await prisma.acquisitionTypeMaster.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Tipo de aquisição excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir tipo de aquisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
