

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  AlertCircle,
  Calendar,
  Building
} from "lucide-react";
import Link from "next/link";

interface ApproverSummary {
  totalRequests: number;
  pendingManagerApproval: number;
  pendingFinalApproval: number;
  approved: number;
  totalDepartments: number;
  departmentsWithPending: number;
  totalValue: number;
  monthlyValue: number;
}

interface PendingRequest {
  id: string;
  requestNumber: string;
  description: string;
  requesterName: string;
  department: string;
  parentDepartment: string | null;
  totalValue: number;
  requestDate: string;
  managerApprovedAt: string | null;
  managerApprovedBy: string | null;
  itemCount: number;
  contractTypes: string[];
  acquisitionTypes: string[];
}

export function ApproverDashboard() {
  const [summary, setSummary] = useState<ApproverSummary>({
    totalRequests: 0,
    pendingManagerApproval: 0,
    pendingFinalApproval: 0,
    approved: 0,
    totalDepartments: 0,
    departmentsWithPending: 0,
    totalValue: 0,
    monthlyValue: 0
  });
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [allRequests, setAllRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryResponse, pendingResponse, allResponse] = await Promise.all([
          fetch("/api/dashboard/approver/summary"),
          fetch("/api/dashboard/approver/pending"),
          fetch("/api/dashboard/approver/all")
        ]);

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingRequests(pendingData);
        }

        if (allResponse.ok) {
          const allData = await allResponse.json();
          setAllRequests(allData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards de Resumo */}
      <div className="grid-responsive">
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Solicitações</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{summary.totalRequests}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendentes Autorização</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{summary.pendingManagerApproval}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendentes Aprovação</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{summary.pendingFinalApproval}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{summary.approved}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              <span className="sm:hidden">R$ {(summary.totalValue / 1000).toFixed(0)}k</span>
              <span className="hidden sm:inline">R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Ações de Aprovação */}
        <Card>
          <CardHeader className="p-3 md:p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Ações de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 md:p-6 pt-0">
            <Button asChild className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/pendentes-aprovacao">
                <AlertCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  <span className="sm:hidden">Aprovar ({summary.pendingFinalApproval})</span>
                  <span className="hidden sm:inline">Pendentes Aprovação ({summary.pendingFinalApproval})</span>
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/solicitacoes">
                <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Todas as Solicitações</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/relatorios">
                <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Relatórios Executivos</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Solicitações Pendentes de Aprovação Final */}
        <Card>
          <CardHeader className="p-3 md:p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Pendentes Aprovação Final</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 md:p-6 pt-0">
            {pendingRequests.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200 space-y-2 sm:space-y-0">
                    <div className="space-y-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        #{request.requestNumber}
                        <span className="hidden sm:inline"> - {request.description}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>{request.requesterName}</div>
                        <div className="truncate">{request.department}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('pt-BR')} • {request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}
                      </div>
                      {request.managerApprovedAt && (
                        <div className="text-xs text-green-600">
                          Autorizado em {new Date(request.managerApprovedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right space-y-0 sm:space-y-1 flex-shrink-0">
                      <Badge className="bg-red-100 text-red-800" variant="secondary">
                        <span className="text-xs">Aprovação</span>
                      </Badge>
                      <div className="text-xs text-gray-600">
                        <span className="sm:hidden">R$ {(request.totalValue / 1000).toFixed(0)}k</span>
                        <span className="hidden sm:inline">R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length > 5 && (
                  <div className="text-center pt-2 sm:pt-3">
                    <Button asChild variant="link" size="sm" className="h-6 sm:h-8">
                      <Link href="/dashboard/pendentes-aprovacao">
                        <span className="text-xs sm:text-sm">Ver todas ({pendingRequests.length})</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <CheckCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm">Nenhuma solicitação pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

