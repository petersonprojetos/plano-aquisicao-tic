
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

    if (!session || !["APPROVER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado. Apenas aprovadores podem usar esta função." }, { status: 401 });
    }

    const requestId = params.id;
    const body = await req.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Motivo da rejeição é obrigatório" },
        { status: 400 }
      );
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        department: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
    }

    // Verificar se o gestor já autorizou
    if (request.managerStatus !== "AUTHORIZE") {
      return NextResponse.json({ 
        error: "Solicitação deve ser autorizada primeiro pelo gestor do departamento" 
      }, { status: 400 });
    }

    // Verificar se ainda está pendente de aprovação final
    if (request.approverStatus !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Solicitação já foi processada pelo aprovador" }, { status: 400 });
    }

    // Atualizar status final
    await prisma.request.update({
      where: { id: requestId },
      data: {
        approverStatus: "REJECT",
        status: "REJECTED",
        rejectionReason: reason,
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Rejeitada pelo Aprovador",
        oldStatus: request.status,
        newStatus: "REJECTED",
        createdById: session.user.id,
        comments: `Solicitação rejeitada pelo aprovador final: ${reason}`,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "REQUEST_REJECTED",
        title: "Solicitação rejeitada",
        message: `Sua solicitação #${request.requestNumber} foi rejeitada pelo aprovador: ${reason}`,
      }
    });

    return NextResponse.json({ message: "Solicitação rejeitada" });
  } catch (error) {
    console.error("Erro ao rejeitar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
