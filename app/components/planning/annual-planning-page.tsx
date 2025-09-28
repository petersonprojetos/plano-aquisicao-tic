
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Building, TrendingUp } from "lucide-react";

interface PlanningData {
  id: string;
  name: string;
  budget: number;
  used: number;
  available: number;
  percentage: number;
}

interface AnnualPlanningPageProps {
  planningData: PlanningData[];
  userRole: string;
}

export function AnnualPlanningPage({ planningData, userRole }: AnnualPlanningPageProps) {
  // Calcular totais
  const totalBudget = planningData.reduce((sum, dept) => sum + dept.budget, 0);
  const totalUsed = planningData.reduce((sum, dept) => sum + dept.used, 0);
  const totalAvailable = totalBudget - totalUsed;

  return (
    <div className="space-y-6">
      {planningData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Planos Anuais 2025 - {userRole === "ADMIN" || userRole === "APPROVER" ? "Todos os Departamentos" : "Meus Departamentos"}
                </div>
                {userRole === "ADMIN" && (
                  <Button onClick={() => alert("Funcionalidade de criar novo plano será implementada em breve")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planningData.map((dept) => (
                  <Card key={dept.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5" />
                        {dept.name} - Plano 2025
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Orçamento Total:</span>
                          <span className="font-semibold">
                            R$ {dept.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilizado:</span>
                          <span className="font-semibold text-green-600">
                            R$ {dept.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponível:</span>
                          <span className="font-semibold">
                            R$ {dept.available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${Math.min(dept.percentage, 100)}%`}}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {dept.percentage.toFixed(1)}% utilizado
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {planningData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Orçamento Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {totalUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Utilizado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      R$ {totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">Disponível</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum planejamento encontrado
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Ainda não há planos de orçamento configurados para seu departamento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
