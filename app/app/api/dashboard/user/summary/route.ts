
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

    const [totalRequests, pendingAuthorization, pendingApproval, approved, totalValueResult] = await Promise.all([
      prisma.request.count({
        where: { userId }
      }),
      prisma.request.count({
        where: { 
          userId,
          status: { in: ["OPEN", "PENDING_MANAGER_APPROVAL"] }
        }
      }),
      prisma.request.count({
        where: { 
          userId,
          status: "PENDING_APPROVAL"
        }
      }),
      prisma.request.count({
        where: { 
          userId,
          status: { in: ["APPROVED", "COMPLETED"] }
        }
      }),
      prisma.request.aggregate({
        where: { userId },
        _sum: {
          totalValue: true
        }
      })
    ]);

    return NextResponse.json({
      totalRequests,
      pendingAuthorization,
      pendingApproval,
      approved,
      totalValue: Number(totalValueResult._sum.totalValue) || 0
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
