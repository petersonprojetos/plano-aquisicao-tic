
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
        { error: "Motivo da devolução é obrigatório" },
        { status: 400 }
      );
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId }
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

    // Atualizar status - reset workflow completo para ajustes
    await prisma.request.update({
      where: { id: requestId },
      data: {
        approverStatus: "RETURN",
        managerStatus: "PENDING_AUTHORIZATION", // Reset para o gestor reavaliar
        status: "OPEN",
        rejectionReason: reason,
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Devolvida pelo Aprovador",
        oldStatus: request.status,
        newStatus: "OPEN",
        createdById: session.user.id,
        comments: `Solicitação devolvida pelo aprovador para ajustes no departamento: ${reason}`,
      }
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "STATUS_CHANGED",
        title: "Solicitação devolvida para ajuste",
        message: `Sua solicitação #${request.requestNumber} foi devolvida pelo aprovador para ajustes: ${reason}`,
      }
    });

    return NextResponse.json({ message: "Solicitação devolvida para ajustes no departamento" });
  } catch (error) {
    console.error("Erro ao devolver solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
