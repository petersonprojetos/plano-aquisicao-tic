

"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ItemCategoriesList } from "./item-categories-list";
import { ItemCategoryForm } from "./item-category-form";
import { ItemTypesList } from "./item-types-list";
import { ItemTypeForm } from "./item-type-form";
import { ItemsList } from "./items-list";
import { ItemForm } from "./item-form";
import ExclusionsManagement from "../exclusions-management";
import { Package2, Tag, Package, AlertTriangle } from "lucide-react";

interface ItemCategory {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}

interface ItemType {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}

interface ItemForManagement {
  id: string
  code: string
  name: string
  description?: string
  categoryId: string
  typeId: string
  specifications?: string
  brand?: string
  model?: string
  isActive: boolean
  category: { id: string, code: string, name: string }
  type: { id: string, code: string, name: string }
}

export function ItemsManagement() {
  const [activeTab, setActiveTab] = useState("items");
  
  // References for refreshing lists
  const categoriesListRef = useRef<{ refresh: () => void } | null>(null);
  const typesListRef = useRef<{ refresh: () => void } | null>(null);
  const itemsListRef = useRef<{ refresh: () => void } | null>(null);
  
  // Category modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  
  // Type modal states
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  
  // Item modal states
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<ItemForManagement | null>(null);

  // Category handlers
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryModalMode('create');
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ItemCategory) => {
    setSelectedCategory(category);
    setCategoryModalMode('edit');
    setCategoryModalOpen(true);
  };

  const handleViewCategory = (category: ItemCategory) => {
    setSelectedCategory(category);
    setCategoryModalMode('view');
    setCategoryModalOpen(true);
  };

  const handleCategorySave = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
    // Refresh categories list after save
    if (categoriesListRef.current) {
      categoriesListRef.current.refresh();
    }
  };

  const handleCategoryCancel = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  // Type handlers
  const handleCreateType = () => {
    setSelectedType(null);
    setTypeModalMode('create');
    setTypeModalOpen(true);
  };

  const handleEditType = (type: ItemType) => {
    setSelectedType(type);
    setTypeModalMode('edit');
    setTypeModalOpen(true);
  };

  const handleViewType = (type: ItemType) => {
    setSelectedType(type);
    setTypeModalMode('view');
    setTypeModalOpen(true);
  };

  const handleTypeSave = () => {
    setTypeModalOpen(false);
    setSelectedType(null);
    // Refresh types list after save
    if (typesListRef.current) {
      typesListRef.current.refresh();
    }
  };

  const handleTypeCancel = () => {
    setTypeModalOpen(false);
    setSelectedType(null);
  };

  // Item handlers
  const handleCreateItem = () => {
    setSelectedItem(null);
    setItemModalMode('create');
    setItemModalOpen(true);
  };

  const handleEditItem = (item: ItemForManagement) => {
    setSelectedItem(item);
    setItemModalMode('edit');
    setItemModalOpen(true);
  };

  const handleViewItem = (item: ItemForManagement) => {
    setSelectedItem(item);
    setItemModalMode('view');
    setItemModalOpen(true);
  };

  const handleItemSave = () => {
    setItemModalOpen(false);
    setSelectedItem(null);
    // Refresh items list after save
    if (itemsListRef.current) {
      itemsListRef.current.refresh();
    }
  };

  const handleItemCancel = () => {
    setItemModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="items" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("items")}
            role="button"
          >
            <Package2 className="h-4 w-4" />
            <span>Itens</span>
          </TabsTrigger>
          <TabsTrigger 
            value="types" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("types")}
            role="button"
          >
            <Package className="h-4 w-4" />
            <span>Tipos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("categories")}
            role="button"
          >
            <Tag className="h-4 w-4" />
            <span>Categorias</span>
          </TabsTrigger>
          <TabsTrigger 
            value="exclusions" 
            className="flex items-center space-x-2"
            onClick={() => setActiveTab("exclusions")}
            role="button"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Exclusões</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <ItemsList
            ref={itemsListRef}
            onCreateNew={handleCreateItem}
            onEdit={handleEditItem}
            onView={handleViewItem}
          />
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <ItemTypesList
            ref={typesListRef}
            onCreateNew={handleCreateType}
            onEdit={handleEditType}
            onView={handleViewType}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <ItemCategoriesList
            ref={categoriesListRef}
            onCreateNew={handleCreateCategory}
            onEdit={handleEditCategory}
            onView={handleViewCategory}
          />
        </TabsContent>

        <TabsContent value="exclusions" className="space-y-4">
          <ExclusionsManagement />
        </TabsContent>
      </Tabs>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {categoryModalMode === 'view' && selectedCategory ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detalhes da Categoria</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-mono font-medium">{selectedCategory.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedCategory.name}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p>{selectedCategory.description || 'Sem descrição'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedCategory.isActive ? "default" : "secondary"}>
                    {selectedCategory.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <ItemCategoryForm
              category={categoryModalMode === 'edit' ? selectedCategory : null}
              onSave={handleCategorySave}
              onCancel={handleCategoryCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Type Modal */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {typeModalMode === 'view' && selectedType ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detalhes do Tipo</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-mono font-medium">{selectedType.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedType.name}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p>{selectedType.description || 'Sem descrição'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedType.isActive ? "default" : "secondary"}>
                    {selectedType.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <ItemTypeForm
              type={typeModalMode === 'edit' ? selectedType : null}
              onSave={handleTypeSave}
              onCancel={handleTypeCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {itemModalMode === 'view' && selectedItem ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Detalhes do Item</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-mono font-medium">{selectedItem.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>
                {selectedItem.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                    <p>{selectedItem.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                  <Badge variant="outline">{selectedItem.category.name}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant="outline">{selectedItem.type.name}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marca</label>
                  <p>{selectedItem.brand || 'Não especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                  <p>{selectedItem.model || 'Não especificado'}</p>
                </div>
                {selectedItem.specifications && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Especificações</label>
                    <p>{selectedItem.specifications}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedItem.isActive ? "default" : "secondary"}>
                    {selectedItem.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <ItemForm
              item={itemModalMode === 'edit' ? selectedItem : null}
              onSave={handleItemSave}
              onCancel={handleItemCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
