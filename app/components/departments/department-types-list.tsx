
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  Hash,
  FileText,
  Building
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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

interface DepartmentTypesListProps {
  onEdit: (departmentType: DepartmentType) => void
  onView: (departmentType: DepartmentType) => void
  onCreate: () => void
}

export function DepartmentTypesList({ onEdit, onView, onCreate }: DepartmentTypesListProps) {
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([])
  const [filteredDepartmentTypes, setFilteredDepartmentTypes] = useState<DepartmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDepartmentTypes()
  }, [showInactive])

  useEffect(() => {
    filterDepartmentTypes()
  }, [departmentTypes, searchTerm])

  const fetchDepartmentTypes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/department-types?includeInactive=${showInactive}`)
      if (response.ok) {
        const data = await response.json()
        setDepartmentTypes(data)
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar tipos de departamento',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar tipos de departamento:', error)
      toast({
        title: 'Erro',
        description: 'Erro interno do sistema',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterDepartmentTypes = () => {
    if (!searchTerm) {
      setFilteredDepartmentTypes(departmentTypes)
      return
    }

    const filtered = departmentTypes.filter(type => 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.observations?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredDepartmentTypes(filtered)
  }

  const handleDelete = async (departmentType: DepartmentType) => {
    try {
      const response = await fetch(`/api/department-types/${departmentType.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Tipo de departamento desativado com sucesso!'
        })
        fetchDepartmentTypes()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao desativar tipo de departamento',
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
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Tipos de Departamento
          </CardTitle>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">
              Mostrar inativos
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredDepartmentTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nenhum tipo de departamento encontrado para a busca.' : 'Nenhum tipo de departamento cadastrado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartmentTypes.map((departmentType) => (
                  <TableRow key={departmentType.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1 text-blue-600" />
                        <span className="font-medium font-mono">{departmentType.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{departmentType.name}</div>
                    </TableCell>
                    <TableCell>
                      {departmentType.observations ? (
                        <div className="flex items-start">
                          <FileText className="h-3 w-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600 max-w-md truncate">
                            {departmentType.observations}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sem observações</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="text-sm">
                          {departmentType._count.departments} departamento(s)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={departmentType.isActive ? "default" : "secondary"}
                        className={departmentType.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {departmentType.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(departmentType)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(departmentType)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {departmentType.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                title="Desativar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desativar Tipo de Departamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja desativar o tipo "{departmentType.name}"? 
                                  Esta ação não pode ser desfeita e pode afetar departamentos vinculados.
                                  {departmentType._count.departments > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <strong>Atenção:</strong> Este tipo possui {departmentType._count.departments} departamento(s) vinculado(s).
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(departmentType)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={departmentType._count.departments > 0}
                                >
                                  Desativar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
