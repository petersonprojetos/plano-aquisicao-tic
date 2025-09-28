"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ItemSearchInput } from "@/components/ui/item-search-input";

import type { RequestItem, RequestFormData } from "@/lib/types";

interface ContractType {
  id: string;
  code: string;
  name: string;
}

interface AcquisitionType {
  id: string;
  code: string;
  name: string;
}

interface ItemType {
  id: string;
  code: string;
  name: string;
}

interface ItemCategory {
  id: string;
  code: string;
  name: string;
}

interface RequestFormBaseProps {
  isEditing?: boolean;
  initialData?: RequestFormData;
  requestId?: string;
  onSubmit: (formData: RequestFormData) => Promise<void>;
}

export function RequestFormBase({
  isEditing = false,
  initialData,
  requestId,
  onSubmit
}: RequestFormBaseProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [acquisitionTypes, setAcquisitionTypes] = useState<AcquisitionType[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  
  const [formData, setFormData] = useState<RequestFormData>({
    description: "",
    justification: "",
    items: []
  });

  useEffect(() => {
    if (initialData) {
      // Log para debug
      console.log("Initial Data:", initialData);
      
      // Garante que os IDs dos items estejam corretamente mapeados
      const mappedData = {
        ...initialData,
        items: initialData.items.map(item => {
          const totalValue = (item.quantity || 0) * (item.unitValue || 0);
          return {
            ...item,
            itemTypeId: item.itemType?.id || item.itemTypeId || "",
            itemCategoryId: item.itemCategory?.id || item.itemCategoryId || "",
            contractTypeId: item.contractType?.id || item.contractTypeId || "",
            acquisitionTypeMasterId: item.acquisitionTypeMaster?.id || item.acquisitionTypeMasterId || "",
            totalValue: totalValue
          };
        })
      };
      setFormData(mappedData);
      console.log("Mapped Data:", mappedData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Carregar tipos de contrato
        const contractTypesResponse = await fetch("/api/contract-types");
        if (contractTypesResponse.ok) {
          const data = await contractTypesResponse.json();
          setContractTypes(data);
        }

        // Carregar tipos de aquisição
        const acquisitionTypesResponse = await fetch("/api/acquisition-types");
        if (acquisitionTypesResponse.ok) {
          const data = await acquisitionTypesResponse.json();
          setAcquisitionTypes(data);
        }

        // Carregar tipos de item
        const itemTypesResponse = await fetch("/api/item-types");
        if (itemTypesResponse.ok) {
          const data = await itemTypesResponse.json();
          console.log("Item Types loaded:", data);
          setItemTypes(data);
        }

        // Carregar categorias de item
        const itemCategoriesResponse = await fetch("/api/item-categories");
        if (itemCategoriesResponse.ok) {
          const data = await itemCategoriesResponse.json();
          console.log("Item Categories loaded:", data);
          setItemCategories(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do formulário:", error);
        toast.error("Erro ao carregar dados do formulário");
      }
    };

    fetchFormData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos
    if (!formData.description.trim()) {
      toast.error("A descrição da solicitação é obrigatória.");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um item à solicitação.");
      return;
    }

    const invalidItem = formData.items.find(item => 
      !item.itemName.trim() || item.quantity <= 0 || item.unitValue < 0
    );

    if (invalidItem) {
      toast.error("Verifique os itens: todos devem ter nome, quantidade maior que zero e valor unitário não negativo.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao salvar solicitação:", error);
      toast.error("Erro ao salvar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const quantity = 1;
    const unitValue = 0;
    const newItem: RequestItem = {
      itemName: "",
      itemTypeId: "",
      itemCategoryId: "",
      acquisitionType: "PURCHASE",
      contractTypeId: "",
      acquisitionTypeMasterId: "",
      quantity,
      unitValue,
      totalValue: quantity * unitValue,
      specifications: "",
      model: ""
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Atualiza totalValue quando quantidade ou valor unitário são alterados
          if (field === 'quantity' || field === 'unitValue') {
            updatedItem.totalValue = updatedItem.quantity * updatedItem.unitValue;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleItemSelect = (index: number, selectedItem: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index].itemName = `${selectedItem.name}${selectedItem.model ? ' ' + selectedItem.model : ''}`;
    updatedItems[index].itemTypeId = selectedItem.typeId;
    updatedItems[index].itemCategoryId = selectedItem.categoryId;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Solicitação" : "Nova Solicitação"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Digite a descrição da solicitação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">Justificativa</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Digite a justificativa da solicitação"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Itens</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Item</Label>
                      <ItemSearchInput
                        value={item.itemName}
                        onChange={(value) => updateItem(index, "itemName", value)}
                        placeholder="Nome do item"
                        onItemSelect={(selectedItem) => handleItemSelect(index, selectedItem)}
                      />                      
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo do Item</Label>
                      <Select
                        value={item.itemTypeId}
                        onValueChange={(value) => updateItem(index, "itemTypeId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={item.itemCategoryId}
                        onValueChange={(value) => updateItem(index, "itemCategoryId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.code} - {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Contrato</Label>
                      <Select
                        value={item.contractTypeId}
                        onValueChange={(value) => updateItem(index, "contractTypeId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Aquisição</Label>
                      <Select
                        value={item.acquisitionTypeMasterId}
                        onValueChange={(value) => updateItem(index, "acquisitionTypeMasterId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de aquisição" />
                        </SelectTrigger>
                        <SelectContent>
                          {acquisitionTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Unitário</Label>
                      <Input
                        type="number"
                        value={item.unitValue}
                        onChange={(e) => updateItem(index, "unitValue", parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Especificações</Label>
                      <Textarea
                        value={item.specifications}
                        onChange={(e) => updateItem(index, "specifications", e.target.value)}
                        placeholder="Digite as especificações do item"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Modelo</Label>
                      <Input
                        value={item.model}
                        onChange={(e) => updateItem(index, "model", e.target.value)}
                        placeholder="Digite o modelo do item"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/solicitacoes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}