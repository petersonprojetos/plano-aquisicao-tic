

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Eye, Calendar, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestDetailsModal } from "./request-details-modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
interface Request {
  id: string;
  requestNumber: string;
  description?: string;
  requesterName: string;
  department?: string;
  departmentName?: string;
  parentDepartment?: string;
  parentDepartmentName?: string;
  status: string;
  managerStatus: string;
  approverStatus: string;
  totalValue: number;
  requestDate: string;
  itemCount: number;
  contractTypes: string[];
  acquisitionTypes: string[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  parentName?: string;
}

interface ContractType {
  id: string;
  name: string;
  code: string;
}

interface AcquisitionType {
  id: string;
  name: string;
  code: string;
}

interface SessionUser {
  id: string;
  name: string;
  role: string;
}

interface RequestsPageProps {
  userRole?: string;
  userId?: string;
  sessionUser?: SessionUser;
  status?: string;
}

// Função para obter status e cor baseado no role e status específicos
const getStatusDisplay = (request: Request, userRole?: string) => {
  // Para usuários comuns, mostrar status baseado no fluxo geral
  if (userRole === "USER") {
    switch (request.status) {
      case "PENDING_MANAGER_APPROVAL":
        return { label: "Aguardando Gestor", color: "bg-orange-100 text-orange-800" };
      case "PENDING_APPROVAL":
        return { label: "Aguardando Aprovação", color: "bg-yellow-100 text-yellow-800" };
      case "APPROVED":
        return { label: "Aprovada", color: "bg-green-100 text-green-800" };
      case "REJECTED":
        if (request.managerStatus === "DENY") {
          return { label: "Negada pelo Gestor", color: "bg-red-100 text-red-800" };
        } else if (request.approverStatus === "REJECT") {
          return { label: "Rejeitada", color: "bg-red-100 text-red-800" };
        }
        return { label: "Rejeitada", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
    }
  }
  
  // Para gestores, mostrar status baseado no manager status
  if (userRole === "MANAGER") {
    switch (request.managerStatus) {
      case "PENDING_AUTHORIZATION":
        return { label: "Pendente Autorização", color: "bg-orange-100 text-orange-800" };
      case "AUTHORIZE":
        if (request.approverStatus === "PENDING_APPROVAL") {
          return { label: "Autorizada - Aguardando Aprovação", color: "bg-blue-100 text-blue-800" };
        } else if (request.approverStatus === "APPROVE") {
          return { label: "Aprovada", color: "bg-green-100 text-green-800" };
        } else if (request.approverStatus === "REJECT") {
          return { label: "Rejeitada pelo Aprovador", color: "bg-red-100 text-red-800" };
        }
        return { label: "Autorizada", color: "bg-blue-100 text-blue-800" };
      case "DENY":
        return { label: "Negada", color: "bg-red-100 text-red-800" };
      case "RETURN":
        return { label: "Devolvida", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
    }
  }
  
  // Para aprovadores, mostrar status baseado no approver status
  if (userRole === "APPROVER" || userRole === "ADMIN") {
    if (request.managerStatus !== "AUTHORIZE") {
      return { label: "Aguardando Gestor", color: "bg-orange-100 text-orange-800" };
    }
    
    switch (request.approverStatus) {
      case "PENDING_APPROVAL":
        return { label: "Pendente Aprovação", color: "bg-yellow-100 text-yellow-800" };
      case "APPROVE":
        return { label: "Aprovada", color: "bg-green-100 text-green-800" };
      case "REJECT":
        return { label: "Rejeitada", color: "bg-red-100 text-red-800" };
      case "RETURN":
        return { label: "Devolvida", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
    }
  }
  
  return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" };
};

export function RequestsPage({ userRole, userId, sessionUser, status: initialStatus }: RequestsPageProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [parentDepartments, setParentDepartments] = useState<Department[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [acquisitionTypes, setAcquisitionTypes] = useState<AcquisitionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<Request | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedParentDepartmentId, setSelectedParentDepartmentId] = useState("");
  const [selectedContractTypeId, setSelectedContractTypeId] = useState("");
  const [selectedAcquisitionTypeId, setSelectedAcquisitionTypeId] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus || "all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (initialStatus) params.append('status', initialStatus);
        const response = await fetch(`/api/requests?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [initialStatus]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [departmentsRes, contractTypesRes, acquisitionTypesRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/contract-types"),
          fetch("/api/acquisition-types")
        ]);

        if (departmentsRes.ok) {
          const allDepartments = await departmentsRes.json();
          setDepartments(allDepartments);
          setParentDepartments(allDepartments.filter((dept: Department) => !dept.parentId));
        }

        if (contractTypesRes.ok) {
          const contractTypesData = await contractTypesRes.json();
          setContractTypes(contractTypesData);
        }

        if (acquisitionTypesRes.ok) {
          const acquisitionTypesData = await acquisitionTypesRes.json();
          setAcquisitionTypes(acquisitionTypesData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados para filtros:", error);
      }
    };

    fetchFilterData();
  }, []);

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Função para verificar se uma solicitação pode ser excluída
  const canDeleteRequest = (request: Request) => {
    if (!sessionUser) return false;
    
    // Admin pode excluir qualquer solicitação
    if (sessionUser.role === 'ADMIN') return true;
    
    // Usuário só pode excluir suas próprias solicitações
    if (request.requesterName !== sessionUser.name) return false;
    
    // Verificar status - apenas PENDING_MANAGER_APPROVAL e OPEN permitem exclusão
    const deletableStatuses = ['PENDING_MANAGER_APPROVAL', 'OPEN'];
    return deletableStatuses.includes(request.status);
  };

  // Função para verificar se uma solicitação pode ser editada
  const canEditRequest = (request: Request) => {
    if (!sessionUser) return false;
    
    // Admin pode editar qualquer solicitação
    if (sessionUser.role === 'ADMIN') return true;
    
    // Usuário só pode editar suas próprias solicitações
    if (request.requesterName !== sessionUser.name) return false;
    
    // Verificar status - apenas PENDING_MANAGER_APPROVAL e OPEN permitem edição
    const editableStatuses = ['PENDING_MANAGER_APPROVAL', 'OPEN'];
    return editableStatuses.includes(request.status);
  };

  const handleEditRequest = (request: Request) => {
    router.push(`/dashboard/solicitacoes/${request.id}/edit`);
  };

  const handleDeleteRequest = (request: Request) => {
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/requests/${requestToDelete.id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Solicitação excluída com sucesso!');
        // Recarregar a lista de solicitações
        const fetchResponse = await fetch("/api/requests?type=all");
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setRequests(data);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao excluir solicitação');
      }
    } catch (error) {
      console.error('Erro ao excluir solicitação:', error);
      toast.error('Erro ao excluir solicitação');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setRequestToDelete(null);
    }
  };

  // Aplicar filtros
  const filteredRequests = requests.filter(request => {
    // Filtro de busca
    if (searchTerm && !request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.requesterName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro por departamento pai
    if (selectedParentDepartmentId && request.parentDepartment !== selectedParentDepartmentId) {
      return false;
    }

    // Filtro por departamento
    if (selectedDepartmentId && request.department !== selectedDepartmentId) {
      return false;
    }

    // Filtro por tipo de contrato
    if (selectedContractTypeId && !request.contractTypes.includes(selectedContractTypeId)) {
      return false;
    }

    // Filtro por tipo de aquisição
    if (selectedAcquisitionTypeId && !request.acquisitionTypes.includes(selectedAcquisitionTypeId)) {
      return false;
    }

    // Filtro por status (baseado no role do usuário)
    if (statusFilter && statusFilter !== "all") {
      let matchesStatus = false;
      
      switch (statusFilter) {
        case "PENDING_AUTHORIZATION":
          matchesStatus = request.managerStatus === "PENDING_AUTHORIZATION";
          break;
        case "PENDING_APPROVAL":
          matchesStatus = request.managerStatus === "AUTHORIZE" && request.approverStatus === "PENDING_APPROVAL";
          break;
        case "APPROVED":
          matchesStatus = request.status === "APPROVED" && request.approverStatus === "APPROVE";
          break;
        case "REJECTED":
          matchesStatus = request.managerStatus === "DENY" || request.approverStatus === "REJECT";
          break;
        case "RETURNED":
          matchesStatus = request.managerStatus === "RETURN" || request.approverStatus === "RETURN";
          break;
        default:
          matchesStatus = false;
      }
      
      if (!matchesStatus) {
        return false;
      }
    }

    // Filtro por período
    if (startDate || endDate) {
      const requestDate = new Date(request.requestDate);
      if (startDate && requestDate < new Date(startDate)) {
        return false;
      }
      if (endDate && requestDate > new Date(endDate)) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartmentId("");
    setSelectedParentDepartmentId("");
    setSelectedContractTypeId("");
    setSelectedAcquisitionTypeId("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Filtrar departamentos baseado no departamento pai selecionado
  const availableDepartments = selectedParentDepartmentId
    ? departments.filter(dept => dept.parentId === selectedParentDepartmentId)
    : departments;

  const isManager = userRole === "MANAGER" || userRole === "ADMIN";
  const isApprover = userRole === "APPROVER" || userRole === "ADMIN";

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader className="p-3 md:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            {/* Campo de busca */}
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Buscar</label>
              <Input
                placeholder="Número ou solicitante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Grid responsivo para os outros filtros */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Filtro por Departamento Pai */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Departamento Pai</label>
                <Select value={selectedParentDepartmentId || "all"} onValueChange={(value) => setSelectedParentDepartmentId(value === "all" ? "" : value)}>
                  <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {parentDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="text-xs sm:text-sm">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Departamento */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Departamento</label>
                <Select 
                  value={selectedDepartmentId || "all"} 
                  onValueChange={(value) => setSelectedDepartmentId(value === "all" ? "" : value)}
                  disabled={!selectedParentDepartmentId && departments.length > 50}
                >
                  <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="text-xs sm:text-sm">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Status */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Status</label>
                <Select 
                  value={statusFilter || "all"} 
                  onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDING_AUTHORIZATION">Pendente Autorização</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pendente Aprovação</SelectItem>
                    <SelectItem value="APPROVED">Aprovadas</SelectItem>
                    <SelectItem value="REJECTED">Rejeitadas</SelectItem>
                    <SelectItem value="RETURNED">Devolvidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de limpar filtros */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma solicitação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  {/* Informações principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {request.requestNumber}
                          </h3>
                          {(() => {
                            const statusDisplay = getStatusDisplay(request, userRole);
                            return (
                              <Badge className={`text-xs ${statusDisplay.color}`}>
                                {statusDisplay.label}
                              </Badge>
                            );
                          })()}
                        </div>
                        {request.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                            {request.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Valor total */}
                      <div className="text-right mt-2 sm:mt-0 sm:ml-4">
                        <p className="text-lg sm:text-xl font-bold text-green-600">
                          R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Informações secundárias */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                      <span>
                        <strong>Solicitante:</strong> {request.requesterName}
                      </span>
                      {request.departmentName && (
                        <span>
                          <strong>Departamento:</strong> {request.departmentName}
                        </span>
                      )}
                      {request.parentDepartmentName && (
                        <span>
                          <strong>Setor:</strong> {request.parentDepartmentName}
                        </span>
                      )}
                    </div>

                    {/* Data e quantidade de itens */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(request.requestDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span>{request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}</span>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex justify-end gap-2 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                      className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
                    >
                      <Eye className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                      Ver Detalhes
                    </Button>
                    
                    {/* Botão de edição - só aparece se o usuário pode editar */}
                    {canEditRequest(request) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRequest(request)}
                        className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline sm:ml-2">Editar</span>
                      </Button>
                    )}
                    
                    {/* Botão de exclusão - só aparece se o usuário pode excluir */}
                    {canDeleteRequest(request) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRequest(request)}
                        className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline sm:ml-2">Excluir</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedRequest && (
        <RequestDetailsModal
          requestId={selectedRequest.id}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          isManager={isManager}
          isApprover={isApprover}
          onActionComplete={() => {
            // Recarregar requests após ação
            const fetchRequests = async () => {
              try {
                const response = await fetch("/api/requests?type=all");
                if (response.ok) {
                  const data = await response.json();
                  setRequests(data);
                }
              } catch (error) {
                console.error("Erro ao recarregar solicitações:", error);
              }
            };
            fetchRequests();
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={requestToDelete ? 
          `Tem certeza que deseja excluir a solicitação "${requestToDelete.requestNumber}"? Esta ação não pode ser desfeita.` :
          "Tem certeza que deseja excluir esta solicitação?"
        }
        confirmText={isDeleting ? "Excluindo..." : "Sim, excluir"}
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
}
