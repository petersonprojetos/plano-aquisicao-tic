
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
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

    // Buscar a solicitação
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
        { error: 'Você não tem permissão para excluir esta solicitação' },
        { status: 403 }
      )
    }

    // Verificar se o status permite exclusão
    const deletableStatuses = ['PENDING_MANAGER_APPROVAL', 'OPEN']
    if (!deletableStatuses.includes(existingRequest.status)) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir solicitações com status diferente de "Aguardando Gestor" ou "Pendente Autorização"',
          currentStatus: existingRequest.status 
        },
        { status: 400 }
      )
    }

    // Criar histórico antes da exclusão
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: 'Excluída',
        oldStatus: existingRequest.status,
        newStatus: 'CANCELLED',
        createdById: session.user.id,
        comments: 'Solicitação excluída pelo usuário'
      }
    })

    // Excluir a solicitação (isso também exclui os itens e histórico devido ao cascade)
    await prisma.request.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      message: 'Solicitação excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
