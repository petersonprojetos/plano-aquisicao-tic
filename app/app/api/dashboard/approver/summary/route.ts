
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["APPROVER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Aprovador pode ver dados de todos os departamentos
    const [totalRequests, pendingManagerApproval, pendingFinalApproval, approved, totalValueResult] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({
        where: { 
          status: "PENDING_MANAGER_APPROVAL",
          managerStatus: "PENDING_AUTHORIZATION"
        }
      }),
      prisma.request.count({
        where: {
          status: "PENDING_APPROVAL",
          managerStatus: "AUTHORIZE",
          approverStatus: "PENDING_APPROVAL"
        }
      }),
      prisma.request.count({
        where: { status: "APPROVED" }
      }),
      prisma.request.aggregate({
        _sum: {
          totalValue: true
        }
      })
    ]);

    return NextResponse.json({
      totalRequests,
      pendingManagerApproval,
      pendingFinalApproval,
      approved,
      totalValue: Number(totalValueResult._sum.totalValue) || 0
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do aprovador:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
