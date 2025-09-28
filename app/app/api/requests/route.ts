
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ItemType, ItemCategory, AcquisitionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const parentDepartmentId = searchParams.get('parentDepartmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const contractTypeId = searchParams.get('contractTypeId');
    const acquisitionTypeId = searchParams.get('acquisitionTypeId');
    const status = searchParams.get('status');

    // Controle de acesso baseado no perfil
    let whereConditions: any = {};
    
    if (session.user.role === "USER") {
      // Usuários comuns só podem ver suas próprias solicitações
      whereConditions.userId = session.user.id;
    } else if (session.user.role === "MANAGER") {
      // Gestores só podem ver solicitações do seu departamento
      whereConditions.departmentId = session.user.departmentId;
    } else if (session.user.role === "APPROVER" || session.user.role === "ADMIN") {
      // Aprovadores e Administradores podem ver todas as solicitações
      whereConditions = {};
    }

    // Filtro por departamento específico (respeitando as permissões)
    if (departmentId) {
      if (session.user.role === "MANAGER") {
        // Manager só pode filtrar pelo próprio departamento
        if (departmentId === session.user.departmentId) {
          whereConditions.departmentId = departmentId;
        }
      } else if (session.user.role === "APPROVER" || session.user.role === "ADMIN") {
        // Aprovador e Admin podem filtrar por qualquer departamento
        whereConditions.departmentId = departmentId;
      }
      // USER não pode filtrar por departamento (já está restrito às suas próprias solicitações)
    }

    // Filtro por departamento pai (respeitando as permissões)
    if (parentDepartmentId && !departmentId) {
      if (session.user.role === "APPROVER" || session.user.role === "ADMIN") {
        whereConditions.department = {
          OR: [
            { id: parentDepartmentId },
            { parentId: parentDepartmentId }
          ]
        };
      }
      // MANAGER e USER não podem usar filtro de departamento pai
    }

    // Filtros de data
    if (startDate || endDate) {
      whereConditions.requestDate = {};
      if (startDate) {
        whereConditions.requestDate.gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        whereConditions.requestDate.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Filtros para tipo de contrato e tipo de aquisição
    if (contractTypeId || acquisitionTypeId) {
      whereConditions.items = { some: {} };
      if (contractTypeId) {
        whereConditions.items.some.contractTypeId = contractTypeId;
      }
      if (acquisitionTypeId) {
        whereConditions.items.some.acquisitionTypeMasterId = acquisitionTypeId;
      }
    }

    // Filtro por status
    if (status) {
      whereConditions.status = status;
    }
    
    const requests = await prisma.request.findMany({
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
        departmentName: request.department.name,
        parentDepartment: request.department.parent?.name || null,
        parentDepartmentName: request.department.parent?.name || null,
        status: request.status,
        managerStatus: request.managerStatus,
        approverStatus: request.approverStatus,
        totalValue: Number(request.totalValue),
        requestDate: request.requestDate.toISOString(),
        itemCount: request.items.length,
        contractTypes,
        acquisitionTypes
      };
    });

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário tem departmentId
    if (!session.user.departmentId) {
      return NextResponse.json({ 
        error: "Usuário não possui departamento associado" 
      }, { status: 400 });
    }

    const body = await req.json();
    const { description, justification, items } = body;

    // Validações mais rigorosas
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Pelo menos um item é obrigatório" },
        { status: 400 }
      );
    }

    // Validar cada item
    for (const item of items) {
      if (!item.itemName?.trim()) {
        return NextResponse.json(
          { error: "Nome do item é obrigatório" },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Quantidade deve ser maior que zero" },
          { status: 400 }
        );
      }
      if (item.unitValue < 0) {
        return NextResponse.json(
          { error: "Valor unitário não pode ser negativo" },
          { status: 400 }
        );
      }
    }

    // Gerar número da solicitação
    const requestCount = await prisma.request.count();
    const requestNumber = `REQ-${new Date().getFullYear()}-${String(requestCount + 1).padStart(3, '0')}`;

    // Calcular valor total
    const totalValue = items.reduce((sum: number, item: any) => 
      sum + (Number(item.quantity) * Number(item.unitValue)), 0);

    // Preparar dados dos itens para criação
    const itemsData = items.map((item: any) => {
      return {
        itemName: String(item.itemName || '').trim(),
        // Usar os IDs que vêm do formulário. Converter string vazia para null.
        itemTypeId: item.itemTypeId || null,
        itemCategoryId: item.itemCategoryId || null,
        acquisitionType: item.acquisitionType ? item.acquisitionType as AcquisitionType : AcquisitionType.PURCHASE,
        contractTypeId: item.contractTypeId && item.contractTypeId !== "nao-definido" ? item.contractTypeId : null,
        acquisitionTypeMasterId: item.acquisitionTypeMasterId && item.acquisitionTypeMasterId !== "nao-definido" ? item.acquisitionTypeMasterId : null,
        quantity: Number(item.quantity),
        unitValue: Number(item.unitValue),
        totalValue: Number(item.quantity) * Number(item.unitValue),
        specifications: String(item.specifications || '').trim(),
        brand: item.brand ? String(item.brand).trim() : null,
        model: item.model ? String(item.model).trim() : null,
      };
    });

    // Criar solicitação
    const request = await prisma.request.create({
      data: {
        requestNumber,
        requesterName: session.user.name || '',
        userId: session.user.id,
        departmentId: session.user.departmentId,
        description: description.trim(),
        justification: justification?.trim() || null,
        totalValue,
        status: "PENDING_MANAGER_APPROVAL",
        managerStatus: "PENDING_AUTHORIZATION",
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    });

    // Criar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: request.id,
        action: "Criada",
        newStatus: "PENDING_MANAGER_APPROVAL",
        createdById: session.user.id,
        comments: "Solicitação criada pelo usuário",
      }
    });

    return NextResponse.json({
      message: "Solicitação criada com sucesso",
      request: {
        id: request.id,
        requestNumber: request.requestNumber,
        totalValue: Number(request.totalValue)
      }
    });
  } catch (error) {
    console.error("=== ERRO COMPLETO ===");
    console.error("Tipo do erro:", error?.constructor?.name);
    console.error("Mensagem:", error instanceof Error ? error.message : String(error));
    console.error("Stack:", error instanceof Error ? error.stack : 'N/A');
    console.error("Error completo:", error);
    console.error("=== FIM ERRO ===");
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro interno do servidor: " + errorMessage },
      { status: 500 }
    );
  }
}
