
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
        approverStatus: "APPROVE",
        status: "APPROVED",
        approvedBy: session.user.name,
        approvedAt: new Date(),
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Aprovação Final",
        oldStatus: request.status,
        newStatus: "APPROVED",
        createdById: session.user.id,
        comments: `Solicitação aprovada pelo aprovador final: ${session.user.name}`,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "REQUEST_APPROVED",
        title: "Solicitação aprovada",
        message: `Sua solicitação #${request.requestNumber} foi aprovada e está pronta para execução`,
      }
    });

    return NextResponse.json({ message: "Solicitação aprovada com sucesso" });
  } catch (error) {
    console.error("Erro ao aprovar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
