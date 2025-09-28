
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
        { error: "Motivo da devolução é obrigatório" },
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
      return NextResponse.json({ error: "Você só pode devolver solicitações do seu departamento" }, { status: 403 });
    }

    // Verificar se ainda está pendente de autorização do gestor
    if (request.managerStatus !== "PENDING_AUTHORIZATION") {
      return NextResponse.json({ error: "Solicitação já foi processada pelo gestor" }, { status: 400 });
    }

    // Atualizar status do gestor e geral
    await prisma.request.update({
      where: { id: requestId },
      data: {
        managerStatus: "RETURN",
        managerRejectionReason: reason,
        status: "OPEN", // Volta para o status inicial para o usuário ajustar
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: requestId,
        action: "Devolvida pelo Gestor",
        oldStatus: request.status,
        newStatus: "OPEN",
        createdById: session.user.id,
        comments: `Solicitação devolvida pelo gestor para ajustes: ${reason}`,
      }
    });

    // Criar notificação para o solicitante
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: requestId,
        type: "STATUS_CHANGED",
        title: "Solicitação devolvida para ajustes",
        message: `Sua solicitação #${request.requestNumber} foi devolvida pelo gestor para ajustes: ${reason}`,
      }
    });

    return NextResponse.json({ message: "Solicitação devolvida para ajustes" });
  } catch (error) {
    console.error("Erro ao devolver solicitação pelo gestor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
