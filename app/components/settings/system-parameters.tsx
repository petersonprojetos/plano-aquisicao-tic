

"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Edit2, Trash2, RefreshCw, Palette, ImageIcon, Clock, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

interface SystemParameter {
  id: string;
  name: string;
  value: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PARAMETER_CATEGORIES = {
  appearance: {
    label: "Aparência",
    icon: Palette,
    types: ["COLOR", "IMAGE"],
    description: "Configurações visuais do sistema"
  },
  system: {
    label: "Sistema",
    icon: Settings,
    types: ["STRING", "NUMBER", "BOOLEAN"],
    description: "Configurações gerais do sistema"
  },
  session: {
    label: "Sessão",
    icon: Clock,
    types: ["NUMBER", "BOOLEAN"],
    description: "Configurações de sessão de usuário"
  }
};

export function SystemParameters() {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<SystemParameter | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    type: "STRING",
    description: "",
    isActive: true,
  });

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/system-parameters");
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      }
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error);
      toast.error("Erro ao carregar parâmetros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      value: "",
      type: "STRING",
      description: "",
      isActive: true,
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (parameter: SystemParameter) => {
    setFormData({
      name: parameter.name,
      value: parameter.value,
      type: parameter.type,
      description: parameter.description || "",
      isActive: parameter.isActive,
    });
    setEditingParameter(parameter);
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name || !formData.value || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }

    if (formData.type === "COLOR" && !/^#[0-9A-Fa-f]{6}$/.test(formData.value)) {
      toast.error("Cor deve estar no formato #RRGGBB");
      return false;
    }

    if (formData.type === "NUMBER" && isNaN(Number(formData.value))) {
      toast.error("Valor deve ser um número válido");
      return false;
    }

    if (formData.type === "JSON") {
      try {
        JSON.parse(formData.value);
      } catch (error) {
        toast.error("JSON inválido");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = editingParameter ? `/api/system-parameters/${editingParameter.id}` : "/api/system-parameters";
      const method = editingParameter ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingParameter ? "Parâmetro atualizado!" : "Parâmetro criado!");
        await fetchParameters();
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setEditingParameter(null);
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erro ao salvar parâmetro");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar parâmetro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parâmetro?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/system-parameters/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Parâmetro excluído!");
        await fetchParameters();
      } else {
        toast.error("Erro ao excluir parâmetro");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir parâmetro");
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (parameter: SystemParameter) => {
    switch (parameter.type) {
      case "COLOR":
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: parameter.value }}
            />
            <span className="font-mono text-sm">{parameter.value}</span>
          </div>
        );
      case "BOOLEAN":
        return (
          <Badge className={parameter.value === "true" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {parameter.value === "true" ? "Ativo" : "Inativo"}
          </Badge>
        );
      case "IMAGE":
        return (
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm truncate max-w-40">{parameter.value}</span>
          </div>
        );
      default:
        return <span className="truncate max-w-60">{parameter.value}</span>;
    }
  };

  const getParametersByCategory = (category: string) => {
    const categoryConfig = PARAMETER_CATEGORIES[category as keyof typeof PARAMETER_CATEGORIES];
    return parameters.filter(param => categoryConfig.types.includes(param.type));
  };

  const ParameterForm = useCallback(({ isEdit = false }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Parâmetro *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="nome_do_parametro"
            pattern="^[a-z][a-z0-9_]*$"
            title="Use apenas letras minúsculas, números e underscore"
            disabled={isEdit}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use apenas letras minúsculas, números e _ (underscore)
          </p>
        </div>
        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value, value: "" })}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRING">Texto</SelectItem>
              <SelectItem value="NUMBER">Número</SelectItem>
              <SelectItem value="BOOLEAN">Sim/Não</SelectItem>
              <SelectItem value="COLOR">Cor</SelectItem>
              <SelectItem value="IMAGE">Imagem</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="value">Valor *</Label>
        {formData.type === "BOOLEAN" ? (
          <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verdadeiro</SelectItem>
              <SelectItem value="false">Falso</SelectItem>
            </SelectContent>
          </Select>
        ) : formData.type === "COLOR" ? (
          <div className="flex space-x-2">
            <Input
              type="color"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-20 h-10 p-1"
            />
            <Input
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="#000000"
              pattern="^#[0-9A-Fa-f]{6}$"
              className="flex-1"
            />
          </div>
        ) : formData.type === "JSON" ? (
          <Textarea
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
            placeholder='{"exemplo": "valor"}'
            rows={4}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
            placeholder="Digite o valor"
            type={formData.type === "NUMBER" ? "number" : "text"}
          />
        )}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o propósito deste parâmetro"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Parâmetro ativo</Label>
      </div>
    </form>
  ), [formData, handleSubmit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Parâmetros do Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Configure os parâmetros globais da aplicação
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Parâmetro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Parâmetro</DialogTitle>
              </DialogHeader>
              <ParameterForm isEdit={false} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" form="parameter-form" disabled={loading}>
                  {loading ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(PARAMETER_CATEGORIES).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(PARAMETER_CATEGORIES).map(([key, config]) => (
              <TabsContent key={key} value={key}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <config.icon className="h-5 w-5" />
                    {config.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                </div>

                {getParametersByCategory(key).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum parâmetro encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getParametersByCategory(key).map((parameter) => (
                          <TableRow key={parameter.id}>
                            <TableCell className="font-mono text-sm">
                              {parameter.name}
                            </TableCell>
                            <TableCell>{renderValue(parameter)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {parameter.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={parameter.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {parameter.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-60">
                              <span className="text-sm text-gray-600 truncate block">
                                {parameter.description || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(parameter)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(parameter.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Parâmetro</DialogTitle>
          </DialogHeader>
          <ParameterForm isEdit={true} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" form="parameter-form" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
