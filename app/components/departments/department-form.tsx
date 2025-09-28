
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, X } from 'lucide-react'

interface DepartmentType {
  id: string
  code: string
  name: string
  isActive: boolean
}

interface Department {
  id: string
  code: string
  sigla_departamento?: string
  name: string
  parentId?: string
  typeId?: string
  commander?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  annualBudget?: number
  observations?: string
  isActive: boolean
  parent?: {
    id: string
    name: string
    code: string
  }
  type?: {
    id: string
    name: string
    code: string
  }
}

interface DepartmentFormData {
  code: string
  sigla_departamento?: string
  name: string
  parentId?: string
  typeId?: string
  commander?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  annualBudget?: string
  observations?: string
  isActive: boolean
}

interface DepartmentFormProps {
  department?: Department
  onSave: () => void
  onCancel: () => void
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export function DepartmentForm({ department, onSave, onCancel }: DepartmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([])
  const [availableDepartmentTypes, setAvailableDepartmentTypes] = useState<DepartmentType[]>([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<DepartmentFormData>({
    defaultValues: {
      code: department?.code || '',
      sigla_departamento: department?.sigla_departamento || '',
      name: department?.name || '',
      parentId: department?.parentId || '',
      typeId: department?.typeId || '',
      commander: department?.commander || '',
      phone: department?.phone || '',
      address: department?.address || '',
      city: department?.city || '',
      state: department?.state || '',
      zipCode: department?.zipCode || '',
      country: department?.country || 'Brasil',
      annualBudget: department?.annualBudget?.toString() || '',
      observations: department?.observations || '',
      isActive: department?.isActive ?? true
    }
  })

  const watchedState = watch('state')
  const watchedParentId = watch('parentId')
  const watchedTypeId = watch('typeId')
  const watchedIsActive = watch('isActive')

  useEffect(() => {
    fetchDepartments()
    fetchDepartmentTypes()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments?includeInactive=false')
      if (response.ok) {
        const data = await response.json()
        // Filtra para não incluir o próprio departamento como opção de pai
        const filtered = data.filter((d: Department) => d.id !== department?.id)
        setAvailableDepartments(filtered)
      }
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error)
    }
  }

  const fetchDepartmentTypes = async () => {
    try {
      const response = await fetch('/api/department-types?includeInactive=false')
      if (response.ok) {
        const data = await response.json()
        setAvailableDepartmentTypes(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tipos de departamento:', error)
    }
  }

  const onSubmit = async (data: DepartmentFormData) => {
    setIsLoading(true)
    
    try {
      const formData = {
        ...data,
        parentId: data.parentId === '' ? null : data.parentId,
        typeId: data.typeId === '' ? null : data.typeId,
        annualBudget: data.annualBudget === '' || !data.annualBudget ? null : parseFloat(data.annualBudget),
        sigla_departamento: data.sigla_departamento === '' ? null : data.sigla_departamento,
        commander: data.commander === '' ? null : data.commander,
        phone: data.phone === '' ? null : data.phone,
        address: data.address === '' ? null : data.address,
        city: data.city === '' ? null : data.city,
        state: data.state === '' ? null : data.state,
        zipCode: data.zipCode === '' ? null : data.zipCode,
        observations: data.observations === '' ? null : data.observations
      }

      const url = department ? `/api/departments/${department.id}` : '/api/departments'
      const method = department ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: department 
            ? 'Departamento atualizado com sucesso!' 
            : 'Departamento criado com sucesso!'
        })
        onSave()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao salvar departamento',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: 'Erro',
        description: 'Erro interno do sistema',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {department ? 'Editar Departamento' : 'Novo Departamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                maxLength={10}
                placeholder="Informe o código do departamento (máx. 10 caracteres)"
                {...register('code', { 
                  required: 'Código é obrigatório',
                  minLength: { value: 2, message: 'Código deve ter pelo menos 2 caracteres' },
                  maxLength: { value: 10, message: 'Código deve ter no máximo 10 caracteres' }
                })}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sigla_departamento">Sigla</Label>
              <Input
                id="sigla_departamento"
                maxLength={10}
                placeholder="Ex: TI, RH, FIN (máx. 10 caracteres)"
                {...register('sigla_departamento', { 
                  maxLength: { value: 10, message: 'Sigla deve ter no máximo 10 caracteres' }
                })}
                className={errors.sigla_departamento ? 'border-red-500' : ''}
              />
              {errors.sigla_departamento && <p className="text-sm text-red-500">{errors.sigla_departamento.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Departamento *</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
                })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentId">Departamento Pai</Label>
              <Select 
                value={watchedParentId} 
                onValueChange={(value) => setValue('parentId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento pai (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (Departamento Raiz)</SelectItem>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeId">Tipo de Departamento</Label>
              <Select 
                value={watchedTypeId} 
                onValueChange={(value) => setValue('typeId', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de departamento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definido</SelectItem>
                  {availableDepartmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commander">Comandante/Responsável</Label>
              <Input
                id="commander"
                {...register('commander')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualBudget">Orçamento Anual (R$)</Label>
            <Input
              id="annualBudget"
              type="number"
              step="0.01"
              min="0"
              {...register('annualBudget', {
                pattern: {
                  value: /^\d*\.?\d*$/,
                  message: 'Digite um valor válido'
                }
              })}
              className={errors.annualBudget ? 'border-red-500' : ''}
            />
            {errors.annualBudget && <p className="text-sm text-red-500">{errors.annualBudget.message}</p>}
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Logradouro</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register('city')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select 
                  value={watchedState || ''} 
                  onValueChange={(value) => setValue('state', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  {...register('zipCode', {
                    pattern: {
                      value: /^\d{5}-?\d{3}$/,
                      message: 'CEP deve estar no formato 00000-000'
                    }
                  })}
                  placeholder="00000-000"
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                {...register('country')}
                defaultValue="Brasil"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register('observations')}
              rows={3}
              placeholder="Informações adicionais sobre o departamento..."
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive"
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Departamento ativo</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {department ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
