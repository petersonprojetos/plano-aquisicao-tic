
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Não autorizado. Apenas gestores podem usar esta função." }, { status: 401 });
    }

    const requestId = params.id;

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        department: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
    }

    // Verificar se é do departamento do gestor
    if (request.departmentId !== session.user.departmentId) {
      return NextResponse.json({ error: "Você só pode aprovar solicitações do seu departamento" }, { status: 403 });
    }

    // Verificar se ainda está pendente de autorização do gestor
    if (request.managerStatus !== "PENDING_AUTHORIZATION") {
      return NextResponse.json({ error: "Solicitação já foi processada pelo gestor" }, { status: 400 });
    }

    // Atualizar status do gestor e geral
    await prisma.request.update({
      where: { id: requestId },
      data: {
        managerStatus: "AUTHORIZE",
        managerApprovedBy: session.user.name,
        managerApprovedAt: new Date(),
        status: "PENDING_APPROVAL", // Agora vai para aprovação final
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Autorizada pelo Gestor",
        oldStatus: request.status,
        newStatus: "PENDING_APPROVAL",
        createdById: session.user.id,
        comments: `Solicitação autorizada pelo gestor do departamento: ${session.user.name}`,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "STATUS_CHANGED",
        title: "Solicitação autorizada pelo gestor",
        message: `Sua solicitação #${request.requestNumber} foi autorizada pelo gestor e está agora aguardando aprovação final`,
      }
    });

    return NextResponse.json({ 
      message: "Solicitação autorizada pelo gestor. Aguardando aprovação final.",
      status: "PENDING_APPROVAL"
    });
  } catch (error) {
    console.error("Erro ao aprovar solicitação pelo gestor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
