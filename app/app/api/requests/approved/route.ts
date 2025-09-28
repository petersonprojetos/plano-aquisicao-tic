
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role === "USER")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Construir filtros de acordo com o perfil do usuário
    let whereConditions: any = {
      status: { 
        in: ["APPROVED", "IN_PROGRESS", "COMPLETED"] 
      }
    };

    if (session.user.role === "MANAGER") {
      // Gestor só pode ver solicitações aprovadas do seu departamento
      whereConditions.departmentId = session.user.departmentId;
    }
    // APPROVER e ADMIN podem ver todas as solicitações aprovadas

    const requests = await prisma.request.findMany({
      where: whereConditions,
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
        approvedAt: "desc"
      }
    });

    const formattedRequests = requests.map(request => {
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
        status: request.status,
        totalValue: Number(request.totalValue),
        requestDate: request.requestDate.toISOString(),
        approvedAt: request.approvedAt?.toISOString() || new Date().toISOString(),
        itemCount: request.items.length,
        contractTypes,
        acquisitionTypes
      };
    });

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Erro ao buscar solicitações aprovadas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
