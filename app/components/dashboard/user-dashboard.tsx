
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus, 
  TrendingUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface RequestSummary {
  totalRequests: number;
  pendingAuthorization: number;
  pendingApproval: number;
  approved: number;
  totalValue: number;
}

interface RecentRequest {
  id: string;
  requestNumber: string;
  status: string;
  totalValue: number;
  requestDate: string;
  itemCount: number;
}

export function UserDashboard() {
  const [summary, setSummary] = useState<RequestSummary>({
    totalRequests: 0,
    pendingAuthorization: 0,
    pendingApproval: 0,
    approved: 0,
    totalValue: 0
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryResponse, requestsResponse] = await Promise.all([
          fetch("/api/dashboard/user/summary"),
          fetch("/api/dashboard/user/recent")
        ]);

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setRecentRequests(requestsData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800";
      case "PENDING_APPROVAL": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN": return "Aberto";
      case "PENDING_APPROVAL": return "Pendente";
      case "APPROVED": return "Aprovado";
      case "COMPLETED": return "Concluído";
      case "REJECTED": return "Rejeitado";
      default: return status;
    }
  };

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
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{summary.pendingAuthorization}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendentes Aprovação</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{summary.pendingApproval}</div>
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
        {/* Ações Rápidas */}
        <Card>
          <CardHeader className="p-3 md:p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 md:p-6 pt-0">
            <Button asChild className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/solicitar">
                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Nova Solicitação</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/solicitacoes">
                <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Ver Todas as Solicitações</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-8 sm:h-9 md:h-10">
              <Link href="/dashboard/relatorios">
                <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Ver Relatórios</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Solicitações Recentes */}
        <Card>
          <CardHeader className="p-3 md:p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Solicitações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 md:p-6 pt-0">
            {recentRequests.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-50 rounded-lg space-y-1 sm:space-y-0">
                    <div className="space-y-1">
                      <div className="font-medium text-xs sm:text-sm">
                        #{request.requestNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('pt-BR')} • {request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'}
                      </div>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right space-y-0 sm:space-y-1">
                      <Badge className={getStatusColor(request.status)} variant="secondary">
                        <span className="text-xs">{getStatusText(request.status)}</span>
                      </Badge>
                      <div className="text-xs text-gray-600">
                        <span className="sm:hidden">R$ {(request.totalValue / 1000).toFixed(0)}k</span>
                        <span className="hidden sm:inline">R$ {request.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-gray-500">
                <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm">Nenhuma solicitação encontrada</p>
                <Button asChild className="mt-2 sm:mt-3 h-8 sm:h-9">
                  <Link href="/dashboard/solicitar">
                    <span className="text-xs sm:text-sm">Criar primeira solicitação</span>
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
