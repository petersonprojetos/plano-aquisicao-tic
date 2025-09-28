

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, X } from 'lucide-react'

interface ItemCategory {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}

interface ItemCategoryFormProps {
  category?: ItemCategory | null
  onSave: () => void
  onCancel: () => void
}

export function ItemCategoryForm({ category, onSave, onCancel }: ItemCategoryFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code,
        name: category.name,
        description: category.description || '',
        isActive: category.isActive
      })
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        isActive: true
      })
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Código e nome são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const url = category ? `/api/item-categories/${category.id}` : '/api/item-categories'
      const method = category ? 'PUT' : 'POST'

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
          description: `Categoria ${category ? 'atualizada' : 'criada'} com sucesso`,
        })
        onSave()
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || `Não foi possível ${category ? 'atualizar' : 'criar'} a categoria`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${category ? 'atualizar' : 'criar'} categoria`,
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
          {category ? 'Editar Categoria' : 'Nova Categoria'}
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
                placeholder="Informe o código da categoria (máx. 5 dígitos)"
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
                placeholder="Ex: Produto"
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="Descrição da categoria..."
              maxLength={500}
              rows={3}
            />
          </div>

          {category && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  isActive: checked 
                }))}
              />
              <Label htmlFor="isActive">Categoria ativa</Label>
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
