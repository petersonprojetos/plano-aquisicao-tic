

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
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

    const requestId = params.id
    const body = await request.json()
    const { description, justification, items } = body

    if (!description || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Descrição e itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar a solicitação existente
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        items: true
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o dono da solicitação (ou admin)
    if (existingRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta solicitação' },
        { status: 403 }
      )
    }

    // Verificar se o status permite edição
    const editableStatuses = ['PENDING_MANAGER_APPROVAL', 'OPEN']
    if (!editableStatuses.includes(existingRequest.status)) {
      return NextResponse.json(
        { 
          error: 'Não é possível editar solicitações com status diferente de "Aguardando Gestor" ou "Pendente Autorização"',
          currentStatus: existingRequest.status 
        },
        { status: 400 }
      )
    }

    // Calcular novo valor total
    const totalValue = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitValue), 0)

    // Atualizar a solicitação usando transação
    const updatedRequest = await prisma.$transaction(async (prisma) => {
      // Primeiro, excluir todos os itens existentes
      await prisma.requestItem.deleteMany({
        where: { requestId: requestId }
      })

      // Atualizar a solicitação
      const request = await prisma.request.update({
        where: { id: requestId },
        data: {
          description,
          justification,
          totalValue,
          updatedAt: new Date(),
          items: {
            create: items.map((item: any) => ({
              itemName: item.itemName,
              itemTypeId: item.itemTypeId || null,
              itemCategoryId: item.itemCategoryId || null,
              acquisitionType: item.acquisitionType,
              contractTypeId: (item.contractTypeId && item.contractTypeId !== "nao-definido") ? item.contractTypeId : null,
              acquisitionTypeMasterId: (item.acquisitionTypeMasterId && item.acquisitionTypeMasterId !== "nao-definido") ? item.acquisitionTypeMasterId : null,
              quantity: item.quantity,
              unitValue: item.unitValue,
              totalValue: item.quantity * item.unitValue,
              specifications: item.specifications,
              brand: item.brand,
              model: item.model,
            }))
          }
        },
        include: {
          items: true
        }
      })

      // Criar histórico
      await prisma.requestHistory.create({
        data: {
          requestId: requestId,
          action: 'Editada',
          oldStatus: existingRequest.status,
          newStatus: existingRequest.status, // Status permanece o mesmo
          createdById: session.user.id,
          comments: 'Solicitação editada pelo usuário'
        }
      })

      return request
    })

    return NextResponse.json({
      message: 'Solicitação atualizada com sucesso',
      request: {
        id: updatedRequest.id,
        requestNumber: updatedRequest.requestNumber,
        totalValue: Number(updatedRequest.totalValue)
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
