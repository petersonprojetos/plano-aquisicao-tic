

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  X, 
  RotateCcw,
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  Loader2
} from "lucide-react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ApprovalActions } from "@/components/approval-actions";

async function getPendingRequests(session: any) {
  // Filtro baseado no role do usuário
  const whereClause: any = {
    status: "PENDING_APPROVAL",
    managerStatus: "AUTHORIZE",
    approverStatus: "PENDING_APPROVAL"
  };

  // Se for gestor, só mostra solicitações do seu departamento
  if (session.user.role === "MANAGER" && session.user.departmentId) {
    whereClause.departmentId = session.user.departmentId;
  }

  const requests = await prisma.request.findMany({
    where: whereClause,
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
      createdAt: "asc"
    }
  });

  return requests.map(request => {
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
      totalValue: Number(request.totalValue),
      requestDate: request.requestDate,
      managerApprovedAt: request.managerApprovedAt,
      managerApprovedBy: request.managerApprovedBy,
      itemCount: request.items.length,
      contractTypes,
      acquisitionTypes
    };
  });
}

export default async function PendentesAprovacaoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["APPROVER", "ADMIN", "MANAGER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const pendingRequests = await getPendingRequests(session);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Pendentes de Aprovação
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          {pendingRequests.length} solicitação{pendingRequests.length !== 1 ? 'ões' : ''} aguardando aprovação final
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-500 mb-3 md:mb-4" />
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Nenhuma solicitação pendente
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              Todas as solicitações foram processadas ou estão aguardando autorização do gestor.
            </p>
            <Button asChild className="mt-3 md:mt-4 h-8 sm:h-9 md:h-10" variant="outline">
              <Link href="/dashboard">
                <span className="text-xs sm:text-sm">Voltar ao Dashboard</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="p-3 md:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                    <div className="flex items-start gap-2 md:gap-3">
                      <CardTitle className="text-sm md:text-base font-semibold text-gray-900 flex-1">
                        #{request.requestNumber}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <span className="text-xs">Aprovação Pendente</span>
                      </Badge>
                    </div>
                    
                    {request.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{request.requesterName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{request.department}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>
                          {request.requestDate.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>
                          {request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                    </div>

                    {request.managerApprovedAt && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Autorizado pelo gestor em {request.managerApprovedAt.toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 md:gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 md:gap-2 text-gray-900 font-semibold">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm md:text-base">
                        <span className="sm:hidden">R$ {(request.totalValue / 1000).toFixed(0)}k</span>
                        <span className="hidden sm:inline">R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-3 md:px-4 md:px-6 pb-3 md:pb-4 md:pb-6 pt-0">
                {(request.contractTypes.length > 0 || request.acquisitionTypes.length > 0) && (
                  <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                    {request.contractTypes.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Tipos de Contrato:</span> {request.contractTypes.join(', ')}
                      </div>
                    )}
                    {request.acquisitionTypes.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Tipos de Aquisição:</span> {request.acquisitionTypes.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    asChild 
                    variant="outline"
                    className="flex-1 sm:flex-none h-8 sm:h-9 md:h-10"
                    size="sm"
                  >
                    <Link href={`/dashboard/solicitacoes/${request.id}`}>
                      <FileText className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Ver Detalhes</span>
                    </Link>
                  </Button>
                  
                  {(session.user.role === 'APPROVER' || session.user.role === 'ADMIN') && (
                    <ApprovalActions requestId={request.id} requestNumber={request.requestNumber} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
