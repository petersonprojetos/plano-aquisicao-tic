
"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Phone, 
  MapPin, 
  DollarSign, 
  FileText, 
  Calendar,
  Edit,
  Building,
  ChevronRight,
  Globe,
  MessageSquare
} from 'lucide-react'

interface Department {
  id: string
  code: string
  sigla_departamento?: string
  name: string
  parentId?: string
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
  createdAt: string
  updatedAt: string
  parent?: {
    id: string
    name: string
    code: string
  }
  children?: {
    id: string
    name: string
    code: string
  }[]
  _count: {
    users: number
    requests: number
  }
}

interface DepartmentDetailProps {
  department: Department
  onEdit: () => void
  onClose: () => void
}

export function DepartmentDetail({ department, onEdit, onClose }: DepartmentDetailProps) {
  const formatCurrency = (value?: number) => {
    if (!value) return 'Não definido'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFullAddress = () => {
    const parts = [
      department.address,
      department.city,
      department.state,
      department.zipCode
    ].filter(Boolean)
    
    return parts.length > 0 ? parts.join(', ') : null
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">{department.name}</h2>
                <Badge 
                  variant={department.isActive ? "default" : "secondary"}
                  className={department.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {department.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-lg font-mono text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {department.code}
                </span>
                {department.sigla_departamento && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {department.sigla_departamento}
                  </span>
                )}
              </div>

              {/* Hierarquia */}
              {department.parent && (
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <Building className="h-4 w-4 mr-1" />
                  <span>Subordinado a:</span>
                  <ChevronRight className="h-3 w-3 mx-1" />
                  <span className="font-medium">{department.parent.code} - {department.parent.name}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Comandante</label>
              <p className="text-lg">
                {department.commander || (
                  <span className="text-gray-400 italic">Não informado</span>
                )}
              </p>
            </div>

            {department.phone && (
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone</label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <p className="text-lg">{department.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Localização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getFullAddress() ? (
              <>
                {department.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <p>{department.address}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {department.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cidade</label>
                      <p>{department.city}</p>
                    </div>
                  )}
                  
                  {department.state && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <p>{department.state}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {department.zipCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">CEP</label>
                      <p>{department.zipCode}</p>
                    </div>
                  )}
                  
                  {department.country && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">País</label>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-gray-400" />
                        <p>{department.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-400 italic">Endereço não informado</p>
            )}
          </CardContent>
        </Card>

        {/* Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-600">Orçamento Anual</label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(department.annualBudget)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {department._count.users}
                </div>
                <div className="text-sm text-gray-600">Usuários</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {department._count.requests}
                </div>
                <div className="text-sm text-gray-600">Solicitações</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subdepartamentos */}
      {department.children && department.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Subdepartamentos ({department.children.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {department.children.map((child) => (
                <div 
                  key={child.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  <div>
                    <div className="font-medium">{child.code}</div>
                    <div className="text-sm text-gray-600">{child.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {department.observations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{department.observations}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Criado em</label>
              <p>{formatDate(department.createdAt)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-600">Última atualização</label>
              <p>{formatDate(department.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
