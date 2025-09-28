
"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Settings,
  Hash,
  FileText,
  Building,
  Calendar,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DepartmentType {
  id: string
  code: string
  name: string
  observations?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    departments: number
  }
}

interface DepartmentTypeDetailProps {
  departmentType: DepartmentType
  onEdit: () => void
  onClose: () => void
}

export function DepartmentTypeDetail({ departmentType, onEdit, onClose }: DepartmentTypeDetailProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Detalhes do Tipo de Departamento
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Informações Básicas
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Código:</span>
                  </div>
                  <span className="font-mono font-bold text-blue-600">
                    {departmentType.code}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="font-medium">Nome:</span>
                  </div>
                  <span className="font-semibold">
                    {departmentType.name}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={departmentType.isActive ? "default" : "secondary"}
                    className={departmentType.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {departmentType.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Estatísticas
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Departamentos:</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {departmentType._count.departments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Observações */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Observações
          </h3>
          
          {departmentType.observations ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 whitespace-pre-wrap">
                {departmentType.observations}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border text-center">
              <p className="text-gray-500 italic">
                Nenhuma observação cadastrada para este tipo de departamento.
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Informações de Auditoria */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Informações de Auditoria
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Criação:</Label>
              <p className="text-sm text-gray-600">
                {formatDate(departmentType.createdAt)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Última Atualização:</Label>
              <p className="text-sm text-gray-600">
                {formatDate(departmentType.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {departmentType._count.departments > 0 && (
          <>
            <Separator />
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Departamentos Vinculados</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Este tipo possui {departmentType._count.departments} departamento(s) vinculado(s). 
                    Qualquer alteração neste tipo pode afetar os departamentos associados.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-gray-700">{children}</span>
}
