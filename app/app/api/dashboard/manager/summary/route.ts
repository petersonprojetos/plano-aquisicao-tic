
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Filtro baseado no departamento do gestor
    const departmentFilter = session.user.role === "MANAGER" ? 
      { departmentId: session.user.departmentId } : {};

    const [totalRequests, pendingManagerApproval, pendingFinalApproval, approved, totalDepartments, totalValueResult, monthlyValueResult] = await Promise.all([
      prisma.request.count({
        where: departmentFilter
      }),
      prisma.request.count({
        where: { 
          ...departmentFilter,
          status: "PENDING_MANAGER_APPROVAL",
          managerStatus: "PENDING_AUTHORIZATION"
        }
      }),
      prisma.request.count({
        where: {
          ...departmentFilter,
          status: "PENDING_APPROVAL",
          managerStatus: "AUTHORIZE",
          approverStatus: "PENDING_APPROVAL"
        }
      }),
      prisma.request.count({
        where: { 
          ...departmentFilter,
          status: "APPROVED" 
        }
      }),
      prisma.department.count({
        where: session.user.role === "MANAGER" ? 
          { id: session.user.departmentId, isActive: true } : 
          { isActive: true }
      }),
      prisma.request.aggregate({
        where: departmentFilter,
        _sum: {
          totalValue: true
        }
      }),
      prisma.request.aggregate({
        where: {
          ...departmentFilter,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          totalValue: true
        }
      })
    ]);

    return NextResponse.json({
      totalRequests,
      pendingAuthorization: pendingManagerApproval,  // Solicitações aguardando autorização do gestor
      pendingApproval: pendingFinalApproval,         // Solicitações autorizadas aguardando aprovação
      approved,
      totalDepartments,
      totalValue: Number(totalValueResult._sum.totalValue) || 0,
      monthlyValue: Number(monthlyValueResult._sum.totalValue) || 0
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do gestor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
