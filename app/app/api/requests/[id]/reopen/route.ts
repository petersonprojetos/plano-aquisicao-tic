
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "APPROVER") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas aprovadores podem reabrir solicitações." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reopenReason } = body;

    if (!reopenReason || reopenReason.trim().length === 0) {
      return NextResponse.json(
        { error: "Justificativa para reabertura é obrigatória" },
        { status: 400 }
      );
    }

    const requestId = params.id;

    // Verificar se a solicitação existe e está aprovada
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        department: true,
      }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      );
    }

    if (existingRequest.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Apenas solicitações aprovadas podem ser reabertas" },
        { status: 400 }
      );
    }

    // Reabrir a solicitação
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: "REOPENED",
        managerStatus: "PENDING_AUTHORIZATION",
        approverStatus: "PENDING_APPROVAL",
        reopenedBy: session.user.name,
        reopenedAt: new Date(),
        reopenReason: reopenReason.trim(),
      },
      include: {
        user: true,
        department: true,
        items: true,
      }
    });

    // Criar registro no histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "REOPENED",
        oldStatus: "APPROVED",
        newStatus: "REOPENED",
        comments: `Solicitação reaberta por ${session.user.name}. Motivo: ${reopenReason.trim()}`,
        createdById: session.user.id,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: existingRequest.userId,
        requestId: requestId,
        type: "STATUS_CHANGED",
        title: "Solicitação Reaberta",
        message: `Sua solicitação #${existingRequest.requestNumber} foi reaberta pelo aprovador. Motivo: ${reopenReason.trim()}`,
      }
    });

    // Criar notificação para o gestor do departamento
    if (existingRequest.managerApprovedBy) {
      const manager = await prisma.user.findFirst({
        where: {
          name: existingRequest.managerApprovedBy,
          role: "MANAGER"
        }
      });

      if (manager) {
        await prisma.notification.create({
          data: {
            userId: manager.id,
            requestId: requestId,
            type: "STATUS_CHANGED",
            title: "Solicitação Reaberta",
            message: `A solicitação #${existingRequest.requestNumber} foi reaberta pelo aprovador. Motivo: ${reopenReason.trim()}`,
          }
        });
      }
    }

    return NextResponse.json({
      message: "Solicitação reaberta com sucesso",
      request: updatedRequest
    });

  } catch (error) {
    console.error("Erro ao reabrir solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
