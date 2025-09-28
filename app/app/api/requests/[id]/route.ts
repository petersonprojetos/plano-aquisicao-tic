import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const requestId = params.id;

    const requestDetails = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        department: {
          include: {
            parent: true,
          },
        },
        items: {
          include: {
            itemType: true,
            itemCategory: true,
            contractType: true,
            acquisitionTypeMaster: true,
          },
        },
        history: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            createdBy: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!requestDetails) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    // Validação de permissão
    const { user } = session;
    if (
      user.role === 'USER' && requestDetails.userId !== user.id
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (
      user.role === 'MANAGER' && requestDetails.departmentId !== user.departmentId
    ) {
      return NextResponse.json({ error: 'Acesso negado a este departamento' }, { status: 403 });
    }

    // Formatação do histórico para incluir o nome do usuário
    const formattedHistory = requestDetails.history.map(h => ({
      ...h,
      createdBy: h.createdBy?.name || 'Usuário removido',
    }));

    return NextResponse.json({ ...requestDetails, history: formattedHistory });

  } catch (error) {
    console.error('Erro ao buscar detalhes da solicitação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}