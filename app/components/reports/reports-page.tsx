
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, TrendingUp, Calendar } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatório por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualize solicitações e gastos por departamento
            </p>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Relatório em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Acompanhe a evolução dos gastos mensais
            </p>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Gráfico em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatório por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Filtre dados por período específico
            </p>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Filtros em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Status das Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Distribuição por status das solicitações
            </p>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Dashboard em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
