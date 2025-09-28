
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCcw,
  FileText,
  Package,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { ActionModal } from "./action-modal";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  isManager: boolean;
  isApprover?: boolean;
  onActionComplete: () => void;
}

interface RequestItem {
  id: string;
  itemName: string;
  itemType: {
    id: string;
    name: string;
  };
  itemCategory: {
    id: string;
    name: string;
  };
  acquisitionType: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  specifications?: string;
  model?: string;
  supplier?: string;
  estimatedDelivery?: string;
}

interface RequestHistory {
  id: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  comments?: string;
  createdBy: string;
  createdAt: string;
}

interface RequestDetails {
  id: string;
  requestNumber: string;
  requesterName: string;
  requesterEmail: string;
  department: {
    name: string;
    code: string;
    commander?: string;
    phone?: string;
  };
  status: string;
  managerStatus?: string;
  approverStatus?: string;
  requestDate: string;
  totalValue: number;
  description?: string;
  justification?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  items: RequestItem[];
  history: RequestHistory[];
}

export function RequestDetailsModal({ isOpen, onClose, requestId, isManager, isApprover, onActionComplete }: RequestDetailsModalProps) {
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'return' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
    }
  }, [isOpen, requestId]);

  const fetchRequestDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (request: RequestDetails) => {
    // Lógica baseada no fluxo de aprovação
    if (request.status === "PENDING_MANAGER_APPROVAL") {
      return { 
        text: "Pendente Autorização", 
        color: "bg-orange-100 text-orange-800" 
      };
    }
    
    if (request.status === "PENDING_APPROVAL") {
      return { 
        text: "Pendente Aprovação", 
        color: "bg-yellow-100 text-yellow-800" 
      };
    }
    
    if (request.status === "APPROVED") {
      return { 
        text: "Aprovada", 
        color: "bg-green-100 text-green-800" 
      };
    }
    
    if (request.status === "REJECTED") {
      return { 
        text: "Rejeitada", 
        color: "bg-red-100 text-red-800" 
      };
    }
    
    if (request.status === "COMPLETED") {
      return { 
        text: "Concluída", 
        color: "bg-emerald-100 text-emerald-800" 
      };
    }
    
    // Status padrão
    return { 
      text: request.status, 
      color: "bg-gray-100 text-gray-800" 
    };
  };

  // Agora os dados já vêm corretos da API, não precisamos de mapeamento

  const getAcquisitionTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      "PURCHASE": "Compra",
      "RENTAL": "Locação",
      "RENEWAL": "Renovação"
    };
    return types[type] || type;
  };

  const handleAction = async (action: 'approve' | 'reject' | 'return', reason?: string) => {
    try {
      // Usar endpoints diferentes para gestor vs aprovador
      let endpoint = `/api/requests/${requestId}/${action}`;
      
      if (canManage) {
        // Ações do gestor usam endpoints específicos
        const managerActions = {
          approve: 'manager-approve',
          reject: 'manager-reject', 
          return: 'manager-return'
        };
        endpoint = `/api/requests/${requestId}/${managerActions[action]}`;
      }
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: reason ? JSON.stringify({ reason }) : undefined
      });

      if (response.ok) {
        setActionModal({ type: null, isOpen: false });
        onActionComplete();
        onClose();
      }
    } catch (error) {
      console.error(`Erro ao ${action} solicitação:`, error);
    }
  };

  const canManage = isManager && request?.status === "PENDING_MANAGER_APPROVAL";
  const canApprove = isApprover && request?.status === "PENDING_APPROVAL" && request?.approverStatus === "PENDING_APPROVAL";

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Solicitação
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Carregando detalhes...</p>
              </div>
            </div>
          ) : request ? (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Cabeçalho da Solicitação */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">#{request.requestNumber}</CardTitle>
                        <p className="text-gray-600 mt-1">
                          Criada em {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={getStatusDisplay(request).color} variant="secondary">
                        {getStatusDisplay(request).text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{request.requesterName}</p>
                          <p className="text-sm text-gray-600">{request.requesterEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{request.department.name}</p>
                          <p className="text-sm text-gray-600">
                            {request.department.code}
                            {request.department.commander && ` • ${request.department.commander}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Descrição e Justificativa */}
                {(request.description || request.justification) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Descrição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {request.description && (
                        <div>
                          <h4 className="font-medium mb-2">Descrição:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.description}</p>
                        </div>
                      )}
                      {request.justification && (
                        <div>
                          <h4 className="font-medium mb-2">Justificativa:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.justification}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Itens da Solicitação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Itens Solicitados ({request.items?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {request.items && request.items.length > 0 ? (
                        <>
                          {request.items.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold">{index + 1}. {item.itemName}</h4>
                                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                    <span><strong>Tipo:</strong> {item.itemType?.name || 'N/A'}</span>
                                    <span>•</span>
                                    <span><strong>Categoria:</strong> {item.itemCategory?.name || 'N/A'}</span>
                                    <span>•</span>
                                    <span><strong>Aquisição:</strong> {getAcquisitionTypeText(item.acquisitionType)}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity}x R$ {item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                              
                              {(item.specifications || item.model) && (
                                <div className="space-y-2">
                                  {item.specifications && (
                                    <div>
                                      <span className="font-medium text-sm">Especificações:</span>
                                      <p className="text-sm text-gray-700">{item.specifications}</p>
                                    </div>
                                  )}
                                  {item.model && (
                                    <div className="flex gap-4 text-sm">
                                      <span><strong>Modelo:</strong> {item.model}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <Separator />
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-semibold">Total Geral:</span>
                            <span className="text-xl font-bold text-green-600">
                              R$ {request.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum item encontrado nesta solicitação.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico */}
                {request.history && request.history.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Histórico
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {request.history.map((item) => (
                          <div key={item.id} className="border-l-2 border-blue-200 pl-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.action}</p>
                                <p className="text-sm text-gray-600">por {item.createdBy}</p>
                                {item.comments && (
                                  <p className="text-sm text-gray-700 mt-1 italic">"{item.comments}"</p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ações do Gestor */}
                {canManage && (
                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-orange-800">Ações do Gestor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setActionModal({ type: 'approve', isOpen: true })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Autorizar
                        </Button>
                        <Button
                          onClick={() => setActionModal({ type: 'reject', isOpen: true })}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Negar
                        </Button>
                        <Button
                          onClick={() => setActionModal({ type: 'return', isOpen: true })}
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Devolver para Ajustes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ações do Aprovador */}
                {canApprove && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800">Ações do Aprovador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setActionModal({ type: 'approve', isOpen: true })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => setActionModal({ type: 'return', isOpen: true })}
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Devolver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p>Erro ao carregar detalhes da solicitação</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ type: null, isOpen: false })}
        action={actionModal.type}
        onConfirm={handleAction}
        isManager={isManager}
      />
    </>
  );
}
