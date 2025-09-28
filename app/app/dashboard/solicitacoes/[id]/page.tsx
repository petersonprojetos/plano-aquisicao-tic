

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  X
} from "lucide-react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { RequestActions } from "@/components/request-actions";

interface Props {
  params: {
    id: string;
  };
}

async function getRequest(id: string) {
  try {
    const request = await prisma.request.findUnique({
      where: { id },
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
        },
        history: {
          include: {
            createdBy: true,
            updatedBy: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!request) {
      return null;
    }

    return {
      ...request,
      totalValue: Number(request.totalValue),
      items: request.items.map(item => ({
        ...item,
        unitValue: Number(item.unitValue),
        totalValue: Number(item.totalValue)
      }))
    };
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'OPEN':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Aberto</Badge>;
    case 'PENDING_MANAGER_APPROVAL':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendente Autorização</Badge>;
    case 'PENDING_APPROVAL':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Pendente Aprovação</Badge>;
    case 'APPROVED':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>;
    case 'REOPENED':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Reaberto</Badge>;
    case 'REJECTED':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitado</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
    case 'COMPLETED':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluído</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function SolicitacaoDetalhePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const request = await getRequest(params.id);

  if (!request) {
    notFound();
  }

  // Verificar se o usuário pode ver esta solicitação
  const canView = 
    session.user.role === "ADMIN" ||
    request.userId === session.user.id ||
    (session.user.role === "MANAGER" && request.departmentId === session.user.departmentId) ||
    session.user.role === "APPROVER";

  if (!canView) {
    redirect("/dashboard");
  }

  const canApprove = 
    (session.user.role === "MANAGER" && 
     request.departmentId === session.user.departmentId && 
     request.status === "PENDING_MANAGER_APPROVAL" &&
     request.managerStatus === "PENDING_AUTHORIZATION") ||
    ((session.user.role === "APPROVER" || session.user.role === "ADMIN") && 
     request.status === "PENDING_APPROVAL" &&
     request.managerStatus === "AUTHORIZE" &&
     request.approverStatus === "PENDING_APPROVAL");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 md:gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8 sm:h-9">
              <Link href="/dashboard/solicitacoes">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
                <span className="text-xs sm:text-sm">Voltar</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              #{request.requestNumber}
            </h1>
          </div>
          {request.description && (
            <p className="text-xs sm:text-sm text-gray-600 pl-8 sm:pl-0">
              {request.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:items-end gap-1 md:gap-2">
          {getStatusBadge(request.status)}
          <div className="text-right">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {request.items.length} {request.items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </div>

      {/* Informações Gerais */}
      <Card>
        <CardHeader className="p-3 md:p-4 md:p-6">
          <CardTitle className="text-sm md:text-base">Informações da Solicitação</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 md:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs sm:text-sm">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Solicitante</span>
              </div>
              <div className="pl-5 sm:pl-6">{request.user.name}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Departamento</span>
              </div>
              <div className="pl-5 sm:pl-6">{request.department.name}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium">Data da Solicitação</span>
              </div>
              <div className="pl-5 sm:pl-6">
                {request.requestDate.toLocaleDateString('pt-BR')}
              </div>
            </div>

            {request.managerApprovedAt && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Autorizado em</span>
                </div>
                <div className="pl-5 sm:pl-6 text-green-600">
                  {request.managerApprovedAt.toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}

            {request.approvedAt && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Aprovado em</span>
                </div>
                <div className="pl-5 sm:pl-6 text-green-600">
                  {request.approvedAt.toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}

            {request.reopenedAt && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Reaberto em</span>
                </div>
                <div className="pl-5 sm:pl-6 text-orange-600">
                  {request.reopenedAt.toLocaleDateString('pt-BR')}
                </div>
                {request.reopenedBy && (
                  <div className="pl-5 sm:pl-6 text-xs text-gray-500 mt-1">
                    Por: {request.reopenedBy}
                  </div>
                )}
              </div>
            )}

            {request.reopenReason && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Motivo da Reabertura</span>
                </div>
                <div className="pl-5 sm:pl-6 text-orange-600">
                  {request.reopenReason}
                </div>
              </div>
            )}

            {(request.rejectionReason || request.managerRejectionReason) && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">Motivo da Rejeição</span>
                </div>
                <div className="pl-5 sm:pl-6 text-red-600">
                  {request.rejectionReason || request.managerRejectionReason}
                </div>
              </div>
            )}
          </div>

          {request.justification && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium text-xs sm:text-sm">Justificativa</span>
              </div>
              <div className="pl-5 sm:pl-6 text-xs sm:text-sm text-gray-700">
                {request.justification}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens da Solicitação */}
      <Card>
        <CardHeader className="p-3 md:p-4 md:p-6">
          <CardTitle className="text-sm md:text-base">Itens Solicitados</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            {request.items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                    <div className="font-medium text-sm md:text-base">
                      {index + 1}. {item.itemName}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Quantidade:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Valor Unitário:</span> R$ {item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>

                      {item.contractType && (
                        <div>
                          <span className="font-medium">Tipo de Contrato:</span> {item.contractType.name}
                        </div>
                      )}
                      {item.acquisitionTypeMaster && (
                        <div>
                          <span className="font-medium">Tipo de Aquisição:</span> {item.acquisitionTypeMaster.name}
                        </div>
                      )}
                    </div>
                    
                    {item.specifications && (
                      <div className="text-xs sm:text-sm text-gray-700">
                        <span className="font-medium">Especificações:</span> {item.specifications}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="font-semibold text-sm md:text-base">
                      R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total do item
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <RequestActions
        requestId={request.id}
        requestStatus={request.status}
        managerStatus={request.managerStatus}
        approverStatus={request.approverStatus}
        requestNumber={request.requestNumber}
        canApprove={canApprove}
      />
    </div>
  );
}

