
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

    // Verificar se é do departamento do gestor
    if (request.departmentId !== session.user.departmentId) {
      return NextResponse.json({ error: "Você só pode negar solicitações do seu departamento" }, { status: 403 });
    }

    // Verificar se ainda está pendente de autorização do gestor
    if (request.managerStatus !== "PENDING_AUTHORIZATION") {
      return NextResponse.json({ error: "Solicitação já foi processada pelo gestor" }, { status: 400 });
    }

    // Atualizar status do gestor e geral
    await prisma.request.update({
      where: { id: requestId },
      data: {
        managerStatus: "DENY",
        managerRejectionReason: reason,
        status: "REJECTED",
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Negada pelo Gestor",
        oldStatus: request.status,
        newStatus: "REJECTED",
        createdById: session.user.id,
        comments: `Solicitação negada pelo gestor: ${reason}`,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "REQUEST_REJECTED",
        title: "Solicitação negada pelo gestor",
        message: `Sua solicitação #${request.requestNumber} foi negada pelo gestor: ${reason}`,
      }
    });

    return NextResponse.json({ message: "Solicitação negada pelo gestor" });
  } catch (error) {
    console.error("Erro ao rejeitar solicitação pelo gestor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
