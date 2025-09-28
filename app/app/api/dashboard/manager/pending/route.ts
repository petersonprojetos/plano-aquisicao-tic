
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

    const pendingRequests = await prisma.request.findMany({
      where: { 
        ...departmentFilter,
        status: "PENDING_MANAGER_APPROVAL",
        managerStatus: "PENDING_AUTHORIZATION"
      },
      include: {
        user: true,
        department: true,
        items: {
          include: {
            contractType: true,
            acquisitionTypeMaster: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const formattedRequests = pendingRequests.map(request => {
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
        totalValue: Number(request.totalValue),
        requestDate: request.requestDate.toISOString(),
        itemCount: request.items.length,
        contractTypes,
        acquisitionTypes
      };
    });

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Erro ao buscar solicitações pendentes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
