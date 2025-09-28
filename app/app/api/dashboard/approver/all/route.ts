
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["APPROVER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const statusFilter = searchParams.get('status');

    let whereConditions: any = {};

    // Filtro por departamento (aprovador pode ver todos)
    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }

    // Filtro por status
    if (statusFilter) {
      if (statusFilter === "pending_manager") {
        whereConditions.status = "PENDING_MANAGER_APPROVAL";
        whereConditions.managerStatus = "PENDING";
      } else if (statusFilter === "pending_final") {
        whereConditions.status = "PENDING_APPROVAL";
        whereConditions.managerStatus = "APPROVED";
        whereConditions.approverStatus = "PENDING";
      } else {
        whereConditions.status = statusFilter.toUpperCase();
      }
    }

    const allRequests = await prisma.request.findMany({
      where: whereConditions,
      include: {
        user: true,
        department: {
          include: {
            parent: true
          }
        },
        items: {
          include: {
            contractType: true,
            acquisitionTypeMaster: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedRequests = allRequests.map(request => {
      // Extrair tipos únicos de contratos e aquisições dos itens da solicitação
      const contractTypes = [...new Set(request.items
        .filter(item => item.contractType)
        .map(item => item.contractType!.name))];
      
      const acquisitionTypes = [...new Set(request.items
        .filter(item => item.acquisitionTypeMaster)
        .map(item => item.acquisitionTypeMaster!.name))];

      return {
        id: request.id,
        requestNumber: request.requestNumber,
        description: request.description,
        requesterName: request.user.name,
        department: request.department.name,
        parentDepartment: request.department.parent?.name || null,
        status: request.status,
        managerStatus: request.managerStatus,
        approverStatus: request.approverStatus,
        totalValue: Number(request.totalValue),
        requestDate: request.requestDate.toISOString(),
        managerApprovedAt: request.managerApprovedAt?.toISOString() || null,
        managerApprovedBy: request.managerApprovedBy,
        approvedAt: request.approvedAt?.toISOString() || null,
        approvedBy: request.approvedBy,
        itemCount: request.items.length,
        contractTypes,
        acquisitionTypes
      };
    });

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Erro ao buscar todas as solicitações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
