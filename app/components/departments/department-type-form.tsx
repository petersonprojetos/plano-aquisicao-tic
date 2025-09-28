
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Settings } from 'lucide-react'

interface DepartmentType {
  id: string
  code: string
  name: string
  observations?: string
  isActive: boolean
  _count?: {
    departments: number
  }
}

interface DepartmentTypeFormProps {
  departmentType?: DepartmentType
  onSave: () => void
  onCancel: () => void
}

export function DepartmentTypeForm({ departmentType, onSave, onCancel }: DepartmentTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    observations: '',
    isActive: true
  })
  const { toast } = useToast()

  useEffect(() => {
    if (departmentType) {
      setFormData({
        code: departmentType.code,
        name: departmentType.name,
        observations: departmentType.observations || '',
        isActive: departmentType.isActive
      })
    }
  }, [departmentType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Código e nome são obrigatórios',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const url = departmentType 
        ? `/api/department-types/${departmentType.id}`
        : '/api/department-types'
      
      const method = departmentType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formData.code.trim(),
          name: formData.name.trim(),
          observations: formData.observations.trim() || null,
          isActive: formData.isActive
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: `Tipo de departamento ${departmentType ? 'atualizado' : 'criado'} com sucesso!`
        })
        onSave()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao salvar tipo de departamento',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Erro interno do sistema',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    // Para campo código numérico, limitar a 5 dígitos
    if (field === 'code' && typeof value === 'string') {
      // Remove caracteres não numéricos e limita a 5 dígitos
      const numericValue = value.replace(/\D/g, '').slice(0, 5)
      setFormData(prev => ({ ...prev, [field]: numericValue }))
      return
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            {departmentType ? 'Editar Tipo de Departamento' : 'Novo Tipo de Departamento'}
          </CardTitle>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                type="number"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="Informe o código do tipo de departamento"
                maxLength={5}
              />
              <p className="text-sm text-gray-500">
                Código único para identificar o tipo (máx. 5 caracteres)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Tipo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Administrativo, Operacional..."
                maxLength={100}
              />
              <p className="text-sm text-gray-500">
                Nome descritivo do tipo de departamento
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Observações adicionais sobre este tipo de departamento..."
              rows={3}
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              Informações adicionais sobre o tipo (opcional, máx. 500 caracteres)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Tipo ativo
            </Label>
            <p className="text-sm text-gray-500 ml-2">
              {formData.isActive ? 'Disponível para uso' : 'Desabilitado para novos departamentos'}
            </p>
          </div>

          {departmentType && departmentType._count && departmentType._count.departments > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Informação:</strong> Este tipo possui {departmentType._count.departments} departamento(s) vinculado(s).
                Alterações podem afetar departamentos existentes.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : (departmentType ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
