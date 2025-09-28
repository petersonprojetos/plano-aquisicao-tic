
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, FileText, Download, Database, Palette, FileSignature, ShoppingCart } from "lucide-react";
import { UserManagement } from "./user-management";
import { SystemParameters } from "./system-parameters";
import { ContractTypeManagement } from "./contract-type-management";
import { AcquisitionTypeManagement } from "./acquisition-type-management";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");

  const handleExportRequests = () => {
    alert("Funcionalidade de exportação de solicitações será implementada em breve");
  };

  const handleExportUsers = () => {
    alert("Funcionalidade de exportação de usuários será implementada em breve");
  };

  const handleExportDepartments = () => {
    alert("Funcionalidade de exportação de departamentos será implementada em breve");
  };

  const handleBackup = () => {
    alert("Funcionalidade de backup será implementada em breve");
  };

  const handleDownloadBackup = () => {
    alert("Funcionalidade de download de backup será implementada em breve");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger 
            value="users" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger 
            value="contract-types" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("contract-types")}
          >
            <FileSignature className="h-4 w-4" />
            <span>Tipos de Contrato</span>
          </TabsTrigger>
          <TabsTrigger 
            value="acquisition-types" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("acquisition-types")}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Tipos de Aquisição</span>
          </TabsTrigger>
          <TabsTrigger 
            value="parameters" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("parameters")}
          >
            <Settings className="h-4 w-4" />
            <span>Parâmetros</span>
          </TabsTrigger>
          <TabsTrigger 
            value="backup" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("backup")}
          >
            <Database className="h-4 w-4" />
            <span>Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="contract-types" className="space-y-6">
          <ContractTypeManagement />
        </TabsContent>

        <TabsContent value="acquisition-types" className="space-y-6">
          <AcquisitionTypeManagement />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <SystemParameters />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportação de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Exporte dados do sistema em diferentes formatos
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportRequests}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Solicitações (Excel)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Exportar Usuários (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportDepartments}>
                    <Settings className="h-4 w-4 mr-2" />
                    Exportar Departamentos (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Faça backup completo dos dados do sistema
                </p>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Último backup:</strong> Nunca realizado
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Recomendamos realizar backup semanalmente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" onClick={handleBackup}>
                      <Database className="h-4 w-4 mr-2" />
                      Realizar Backup Completo
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleDownloadBackup}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Último Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
