
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const recentRequests = await prisma.request.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    const formattedRequests = recentRequests.map(request => ({
      id: request.id,
      requestNumber: request.requestNumber,
      status: request.status,
      totalValue: Number(request.totalValue),
      requestDate: request.requestDate.toISOString(),
      itemCount: request.items.length
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Erro ao buscar solicitações recentes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
