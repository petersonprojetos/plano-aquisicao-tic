

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, X } from 'lucide-react'

interface ItemCategory {
  id: string
  code: string
  name: string
}

interface ItemType {
  id: string
  code: string
  name: string
}

interface Item {
  id: string
  code: string
  name: string
  description?: string
  categoryId: string
  typeId: string
  specifications?: string
  isActive: boolean
}

interface ItemFormProps {
  item?: Item | null
  onSave: () => void
  onCancel: () => void
}

export function ItemForm({ item, onSave, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    typeId: '',
    specifications: '',
    isActive: true
  })
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [types, setTypes] = useState<ItemType[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchTypes()
  }, [])

  // Aguarda que categorias e tipos sejam carregados antes de definir os dados do item
  useEffect(() => {
    if (item && categories.length > 0 && types.length > 0) {
      setFormData({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        categoryId: item.categoryId || '',
        typeId: item.typeId || '',
        specifications: item.specifications || '',
        isActive: item.isActive ?? true
      })
    } else if (!item) {
      setFormData({
        code: '',
        name: '',
        description: '',
        categoryId: '',
        typeId: '',
        specifications: '',
        isActive: true
      })
    }
  }, [item, categories, types])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/item-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/item-types')
      if (response.ok) {
        const data = await response.json()
        setTypes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim() || 
        !formData.categoryId || !formData.typeId) {
      toast({
        title: "Erro",
        description: "Código, nome, categoria e tipo são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const url = item ? `/api/items/${item.id}` : '/api/items'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Item ${item ? 'atualizado' : 'criado'} com sucesso`,
        })
        onSave()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || `Não foi possível ${item ? 'atualizar' : 'criar'} o item`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${item ? 'atualizar' : 'criar'} item`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {item ? 'Editar Item' : 'Novo Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                type="number"
                value={formData.code}
                onChange={(e) => {
                  // Remove caracteres não numéricos e limita a 5 dígitos
                  const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5)
                  setFormData(prev => ({ 
                    ...prev, 
                    code: numericValue 
                  }))
                }}
                placeholder="Informe o código do item (máx. 5 dígitos)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
                placeholder="Nome do item"
                maxLength={200}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="Descrição adicional (opcional)"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria *</Label>
              {categories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">Carregando categorias...</div>
              ) : (
                <Select 
                  key={`category-${formData.categoryId}-${categories.length}`}
                  value={formData.categoryId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, categoryId: value }))
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeId">Tipo *</Label>
              {types.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">Carregando tipos...</div>
              ) : (
                <Select 
                  key={`type-${formData.typeId}-${types.length}`}
                  value={formData.typeId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, typeId: value }))
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>



          <div className="space-y-2">
            <Label htmlFor="specifications">Especificações</Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                specifications: e.target.value 
              }))}
              placeholder="Especificações técnicas do item..."
              maxLength={1000}
              rows={3}
            />
          </div>

          {item && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isActive: checked 
                }))}
              />
              <Label htmlFor="isActive">Item ativo</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
