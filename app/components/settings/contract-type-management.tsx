
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FileSignature } from "lucide-react";
import { toast } from "sonner";

interface ContractType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContractTypeFormProps {
  title: string;
  formData: {
    code: string;
    name: string;
    description: string;
    isActive: boolean;
  };
  editingContractType: ContractType | null;
  onFormDataChange: (data: any) => void;
  onCancel: () => void;
  onSave: () => void;
}

const ContractTypeForm = memo(({ 
  title, 
  formData, 
  editingContractType, 
  onFormDataChange, 
  onCancel, 
  onSave 
}: ContractTypeFormProps) => (
  <div className="space-y-4">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => onFormDataChange({ ...formData, code: e.target.value })}
          placeholder="Ex: NOVO"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="Ex: Novo"
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Descrição</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
        placeholder="Descrição do tipo de contrato"
        rows={3}
      />
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="isActive"
        checked={formData.isActive}
        onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
      />
      <Label htmlFor="isActive">Ativo</Label>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave}>
        {editingContractType ? "Atualizar" : "Criar"} Tipo de Contrato
      </Button>
    </DialogFooter>
  </div>
));

export function ContractTypeManagement() {
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContractType, setEditingContractType] = useState<ContractType | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  // Carregar tipos de contrato
  const fetchContractTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/contract-types?includeInactive=true");
      if (response.ok) {
        const data = await response.json();
        setContractTypes(data);
      } else {
        toast.error("Erro ao carregar tipos de contrato");
      }
    } catch (error) {
      toast.error("Erro ao carregar tipos de contrato");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContractTypes();
  }, [fetchContractTypes]);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
    });
    setEditingContractType(null);
  }, []);

  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(newFormData);
  }, []);

  // Abrir modal de criação
  const handleCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  // Abrir modal de edição
  const handleEdit = (contractType: ContractType) => {
    setEditingContractType(contractType);
    setFormData({
      code: contractType.code,
      name: contractType.name,
      description: contractType.description || "",
      isActive: contractType.isActive,
    });
    setShowEditDialog(true);
  };

  // Salvar tipo de contrato (criar ou editar)
  const handleCancel = useCallback(() => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    resetForm();
  }, [resetForm]);

  const handleSave = useCallback(async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Código e nome são obrigatórios");
      return;
    }

    try {
      const url = editingContractType 
        ? `/api/contract-types/${editingContractType.id}`
        : "/api/contract-types";
      
      const method = editingContractType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingContractType 
            ? "Tipo de contrato atualizado com sucesso!" 
            : "Tipo de contrato criado com sucesso!"
        );
        setShowCreateDialog(false);
        setShowEditDialog(false);
        resetForm();
        fetchContractTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao salvar tipo de contrato");
      }
    } catch (error) {
      toast.error("Erro ao salvar tipo de contrato");
    }
  }, [formData, editingContractType, resetForm, fetchContractTypes]);

  // Excluir tipo de contrato
  const handleDelete = async (contractType: ContractType) => {
    try {
      const response = await fetch(`/api/contract-types/${contractType.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tipo de contrato excluído com sucesso!");
        fetchContractTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao excluir tipo de contrato");
      }
    } catch (error) {
      toast.error("Erro ao excluir tipo de contrato");
    }
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Gerenciar Tipos de Contrato
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo de Contrato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ContractTypeForm 
                title="Criar Novo Tipo de Contrato" 
                formData={formData}
                editingContractType={editingContractType}
                onFormDataChange={handleFormDataChange}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Carregando tipos de contrato...
                  </TableCell>
                </TableRow>
              ) : contractTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum tipo de contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                contractTypes.map((contractType) => (
                  <TableRow key={contractType.id}>
                    <TableCell className="font-medium">
                      {contractType.code}
                    </TableCell>
                    <TableCell>{contractType.name}</TableCell>
                    <TableCell>
                      {contractType.description || "Sem descrição"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={contractType.isActive ? "default" : "secondary"}>
                        {contractType.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={showEditDialog && editingContractType?.id === contractType.id} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(contractType)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <ContractTypeForm 
                              title="Editar Tipo de Contrato" 
                              formData={formData}
                              editingContractType={editingContractType}
                              onFormDataChange={handleFormDataChange}
                              onCancel={handleCancel}
                              onSave={handleSave}
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o tipo de contrato "{contractType.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(contractType)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
