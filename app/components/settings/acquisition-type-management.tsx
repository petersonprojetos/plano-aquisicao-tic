
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
import { Plus, Pencil, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface AcquisitionType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcquisitionTypeFormProps {
  title: string;
  formData: {
    code: string;
    name: string;
    description: string;
    isActive: boolean;
  };
  editingAcquisitionType: AcquisitionType | null;
  onFormDataChange: (data: any) => void;
  onCancel: () => void;
  onSave: () => void;
}

const AcquisitionTypeForm = memo(({ 
  title, 
  formData, 
  editingAcquisitionType, 
  onFormDataChange, 
  onCancel, 
  onSave 
}: AcquisitionTypeFormProps) => (
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
          placeholder="Ex: COMPRA"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="Ex: Compra"
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
        placeholder="Descrição do tipo de aquisição"
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
        {editingAcquisitionType ? "Atualizar" : "Criar"} Tipo de Aquisição
      </Button>
    </DialogFooter>
  </div>
));

export function AcquisitionTypeManagement() {
  const [acquisitionTypes, setAcquisitionTypes] = useState<AcquisitionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAcquisitionType, setEditingAcquisitionType] = useState<AcquisitionType | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  // Carregar tipos de aquisição
  const fetchAcquisitionTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/acquisition-types?includeInactive=true");
      if (response.ok) {
        const data = await response.json();
        setAcquisitionTypes(data);
      } else {
        toast.error("Erro ao carregar tipos de aquisição");
      }
    } catch (error) {
      toast.error("Erro ao carregar tipos de aquisição");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcquisitionTypes();
  }, [fetchAcquisitionTypes]);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
    });
    setEditingAcquisitionType(null);
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
  const handleEdit = (acquisitionType: AcquisitionType) => {
    setEditingAcquisitionType(acquisitionType);
    setFormData({
      code: acquisitionType.code,
      name: acquisitionType.name,
      description: acquisitionType.description || "",
      isActive: acquisitionType.isActive,
    });
    setShowEditDialog(true);
  };

  // Salvar tipo de aquisição (criar ou editar)
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
      const url = editingAcquisitionType 
        ? `/api/acquisition-types/${editingAcquisitionType.id}`
        : "/api/acquisition-types";
      
      const method = editingAcquisitionType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingAcquisitionType 
            ? "Tipo de aquisição atualizado com sucesso!" 
            : "Tipo de aquisição criado com sucesso!"
        );
        setShowCreateDialog(false);
        setShowEditDialog(false);
        resetForm();
        fetchAcquisitionTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao salvar tipo de aquisição");
      }
    } catch (error) {
      toast.error("Erro ao salvar tipo de aquisição");
    }
  }, [formData, editingAcquisitionType, resetForm, fetchAcquisitionTypes]);

  // Excluir tipo de aquisição
  const handleDelete = async (acquisitionType: AcquisitionType) => {
    try {
      const response = await fetch(`/api/acquisition-types/${acquisitionType.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tipo de aquisição excluído com sucesso!");
        fetchAcquisitionTypes();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao excluir tipo de aquisição");
      }
    } catch (error) {
      toast.error("Erro ao excluir tipo de aquisição");
    }
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Gerenciar Tipos de Aquisição
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo de Aquisição
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AcquisitionTypeForm 
                title="Criar Novo Tipo de Aquisição" 
                formData={formData}
                editingAcquisitionType={editingAcquisitionType}
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
                    Carregando tipos de aquisição...
                  </TableCell>
                </TableRow>
              ) : acquisitionTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum tipo de aquisição encontrado
                  </TableCell>
                </TableRow>
              ) : (
                acquisitionTypes.map((acquisitionType) => (
                  <TableRow key={acquisitionType.id}>
                    <TableCell className="font-medium">
                      {acquisitionType.code}
                    </TableCell>
                    <TableCell>{acquisitionType.name}</TableCell>
                    <TableCell>
                      {acquisitionType.description || "Sem descrição"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={acquisitionType.isActive ? "default" : "secondary"}>
                        {acquisitionType.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={showEditDialog && editingAcquisitionType?.id === acquisitionType.id} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(acquisitionType)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <AcquisitionTypeForm 
                              title="Editar Tipo de Aquisição" 
                              formData={formData}
                              editingAcquisitionType={editingAcquisitionType}
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
                                Tem certeza que deseja excluir o tipo de aquisição "{acquisitionType.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(acquisitionType)}
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
