
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { ReopenAction } from "./reopen-action";

interface ApprovedRequest {
  id: string;
  requestNumber: string;
  description?: string;
  requesterName: string;
  department: string;
  status: string;
  totalValue: number;
  requestDate: string;
  approvedAt: string;
  itemCount: number;
  contractTypes: string[];
  acquisitionTypes: string[];
}

export function ApprovedRequestsPage() {
  const [requests, setRequests] = useState<ApprovedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800";
      case "REOPENED": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED": return "Aprovado";
      case "IN_PROGRESS": return "Em Andamento";
      case "COMPLETED": return "Concluído";
      case "REOPENED": return "Reaberto";
      default: return status;
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch("/api/requests/approved");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações aprovadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopenSuccess = () => {
    fetchApprovedRequests();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="p-3 md:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
            Solicitações Aprovadas ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 md:p-6 pt-0">
          {requests.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
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
                        <div className="flex flex-col xs:flex-row xs:gap-2 gap-0 text-xs">
                          <span>Sol.: {new Date(request.requestDate).toLocaleDateString('pt-BR')}</span>
                          <span className="hidden xs:inline">•</span>
                          <span>Apr.: {new Date(request.approvedAt).toLocaleDateString('pt-BR')}</span>
                          <span className="sm:hidden">• {request.department}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}
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
                    </div>
                    
                    <div className="flex flex-row sm:flex-col lg:items-end justify-between sm:justify-start lg:text-right space-x-4 sm:space-x-0 sm:space-y-2 flex-shrink-0">
                      <div className="flex flex-col sm:items-start lg:items-end space-y-1 sm:space-y-2">
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          <span className="text-xs">{getStatusText(request.status)}</span>
                        </Badge>
                        <div className="text-sm sm:text-base md:text-lg font-semibold">
                          <span className="sm:hidden">R$ {(request.totalValue / 1000).toFixed(0)}k</span>
                          <span className="hidden sm:inline">R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {/* Ação de reabertura para solicitações aprovadas */}
                        {request.status === 'APPROVED' && (
                          <div className="mt-2">
                            <ReopenAction
                              requestId={request.id}
                              requestNumber={request.requestNumber}
                              onSuccess={handleReopenSuccess}
                              className="w-full sm:w-auto"
                            />
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
              <p className="text-xs sm:text-sm">Nenhuma solicitação aprovada encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
