
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye, RefreshCcw } from "lucide-react";
import { RequestDetailsModal } from "./request-details-modal";
import { ActionModal } from "./action-modal";

interface PendingRequest {
  id: string;
  requestNumber: string;
  description?: string;
  requesterName: string;
  department: string;
  totalValue: number;
  requestDate: string;
  itemCount: number;
  contractTypes: string[];
  acquisitionTypes: string[];
}

interface PendingRequestsPageProps {
  userRole?: string;
  userId?: string;
  status?: string;
}

export function PendingRequestsPage({ userRole, userId, status }: PendingRequestsPageProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'return' | null;
    isOpen: boolean;
    requestId?: string;
  }>({ type: null, isOpen: false });

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!status) return;
      try {
        const params = new URLSearchParams({ status });
        const endpoint = `/api/requests?${params.toString()}`;
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Erro ao carregar solicitações pendentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, [userRole, status]);

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequestId(null);
  };

  const handleOpenActionModal = (type: 'approve' | 'reject' | 'return', requestId: string) => {
    setActionModal({ type, isOpen: true, requestId });
  };

  const handleCloseActionModal = () => {
    setActionModal({ type: null, isOpen: false });
  };

  const handleAction = async (action: 'approve' | 'reject' | 'return', reason?: string) => {
    const requestId = actionModal.requestId;
    if (!requestId) return;

    try {
      // Determinar endpoint baseado no role e ação
      let endpoint = "";
      
      if (userRole === "APPROVER") {
        // Para aprovadores, usar as APIs padrão
        endpoint = `/api/requests/${requestId}/${action}`;
      } else {
        // Para gestores, usar as APIs específicas de manager
        switch (action) {
          case 'approve':
            endpoint = `/api/requests/${requestId}/manager-approve`;
            break;
          case 'reject':
            endpoint = `/api/requests/${requestId}/manager-reject`;
            break;
          case 'return':
            endpoint = `/api/requests/${requestId}/manager-return`;
            break;
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: reason ? JSON.stringify({ reason }) : undefined
      });

      if (response.ok) {
        setRequests(requests.filter(req => req.id !== requestId));
        handleCloseActionModal();
      }
    } catch (error) {
      console.error(`Erro ao ${action} solicitação:`, error);
    }
  };

  const handleActionComplete = () => {
    // Recarregar a lista de solicitações pendentes
    const fetchPendingRequests = async () => {
      if (!status) return;
      try {
        const params = new URLSearchParams({ status });
        const endpoint = `/api/requests?${params.toString()}`;
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Erro ao carregar solicitações pendentes:", error);
      }
    };
    fetchPendingRequests();
  };

  const isManager = userRole === "MANAGER" || userRole === "ADMIN";

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="p-3 md:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Clock className="h-4 w-4 md:h-5 md:w-5" />
            {userRole === "APPROVER" ? "Solicitações Pendentes de Aprovação" : "Solicitações Pendentes de Autorização"} ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 md:p-6 pt-0">
          {requests.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3 sm:p-4 bg-orange-50 border-orange-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                    <div className="space-y-2 min-w-0">
                      <div className="font-semibold text-sm sm:text-base md:text-lg">
                        <div className="truncate">
                          #{request.requestNumber}
                          <span className="hidden sm:inline">
                            {request.description ? ` - ${request.description}` : ''}
                          </span>
                        </div>
                        <div className="sm:hidden text-xs font-normal text-gray-600 mt-1">
                          {request.description}
                        </div>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">{request.requesterName}</span>
                          <span className="hidden sm:inline"> • {request.department}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span>{new Date(request.requestDate).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span>{request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}</span>
                          <span className="sm:hidden">• {request.department}</span>
                        </div>
                      </div>
                      
                      {/* Tipos de contrato e aquisição */}
                      <div className="flex flex-col xs:flex-row xs:gap-4 gap-1 mt-2">
                        {request.contractTypes && request.contractTypes.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-500">Contrato:</span>
                            <span className="ml-1">{request.contractTypes.join(', ')}</span>
                          </div>
                        )}
                        {request.acquisitionTypes && request.acquisitionTypes.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-500">Aquisição:</span>
                            <span className="ml-1">{request.acquisitionTypes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm sm:text-base md:text-lg font-semibold lg:hidden">
                        <span className="sm:hidden">R$ {(request.totalValue / 1000).toFixed(0)}k</span>
                        <span className="hidden sm:inline">R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 lg:space-y-3 flex-shrink-0">
                      <div className="flex items-center justify-between lg:justify-end">
                        <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                          <span className="text-xs">{userRole === "APPROVER" ? "Pendente Aprovação" : "Pendente Autorização"}</span>
                        </Badge>
                        <div className="hidden lg:block text-sm md:text-lg font-semibold">
                          R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request.id)}
                          className="flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Ver Detalhes</span>
                          <span className="xs:hidden">Ver</span>
                        </Button>
                        
                        {/* Botões de ação só aparecem para Gestores e Admins nesta tela */}
                        {(userRole === "MANAGER" || userRole === "ADMIN") && (
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              onClick={() => handleOpenActionModal('approve', request.id)}
                              className="bg-green-600 hover:bg-green-700 h-8 sm:h-9 px-2 sm:px-3"
                              size="sm"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline text-xs">
                                Autorizar
                              </span>
                            </Button>
                            <Button
                              onClick={() => handleOpenActionModal('return', request.id)}
                              variant="outline"
                              size="sm"
                              className="border-orange-300 text-orange-700 hover:bg-orange-100 h-8 sm:h-9 px-2 sm:px-3"
                            >
                              <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline text-xs">Devolver</span>
                            </Button>
                            <Button
                              onClick={() => handleOpenActionModal('reject', request.id)}
                              variant="destructive"
                              size="sm"
                              className="h-8 sm:h-9 px-2 sm:px-3"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline text-xs">
                                Negar
                              </span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <CheckCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm">Nenhuma solicitação pendente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedRequestId && (
        <RequestDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          requestId={selectedRequestId}
          isManager={isManager}
          onActionComplete={handleActionComplete}
        />
      )}

      {/* Modal de Ações */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={handleCloseActionModal}
        action={actionModal.type}
        onConfirm={handleAction}
        isManager={isManager}
      />
    </div>
  );
}
