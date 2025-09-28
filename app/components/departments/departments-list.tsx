
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
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Building,
  ChevronRight,
  Filter,
  Upload
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ImportDepartmentsModal } from './import-departments-modal'

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

interface DepartmentsListProps {
  onEdit: (department: Department) => void
  onView: (department: Department) => void
  onCreate: () => void
}

export function DepartmentsList({ onEdit, onView, onCreate }: DepartmentsListProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDepartments()
  }, [showInactive])

  useEffect(() => {
    filterDepartments()
  }, [departments, searchTerm])

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/departments?includeInactive=${showInactive}`)
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar departamentos',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error)
      toast({
        title: 'Erro',
        description: 'Erro interno do sistema',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterDepartments = () => {
    if (!searchTerm) {
      setFilteredDepartments(departments)
      return
    }

    const filtered = departments.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.sigla_departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.commander?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.parent?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredDepartments(filtered)
  }

  const handleDelete = async (department: Department) => {
    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Departamento desativado com sucesso!'
        })
        fetchDepartments()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao desativar departamento',
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

  const formatCurrency = (value?: number) => {
    if (!value) return 'Não definido'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getHierarchyDisplay = (department: Department) => {
    if (!department.parent) {
      return (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-1 text-blue-600" />
          <span className="font-medium">{department.code}</span>
        </div>
      )
    }

    return (
      <div className="flex items-center text-sm">
        <Building className="h-3 w-3 mr-1 text-gray-400" />
        <span className="text-gray-600">{department.parent.code}</span>
        <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
        <Building2 className="h-4 w-4 mr-1 text-blue-600" />
        <span className="font-medium">{department.code}</span>
      </div>
    )
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
            <Building2 className="h-5 w-5 mr-2" />
            Gerenciar Departamentos
          </CardTitle>
          <div className="flex space-x-2">
            <ImportDepartmentsModal onImportComplete={fetchDepartments} />
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Departamento
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código, sigla, comandante..."
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
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nenhum departamento encontrado para a busca.' : 'Nenhum departamento cadastrado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Comandante</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Estatísticas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      {getHierarchyDisplay(department)}
                    </TableCell>
                    <TableCell>
                      {department.sigla_departamento ? (
                        <Badge variant="outline" className="font-mono">
                          {department.sigla_departamento}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        {department.children && department.children.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {department.children.length} subdepartamento(s)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {department.commander ? (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {department.commander}
                        </div>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {department.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {department.phone}
                          </div>
                        )}
                        {(department.city || department.state) && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {[department.city, department.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-sm">
                          {formatCurrency(department.annualBudget)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1 text-blue-500" />
                          {department._count.users} usuário(s)
                        </div>
                        <div className="flex items-center text-sm">
                          <FileText className="h-3 w-3 mr-1 text-orange-500" />
                          {department._count.requests} solicitação(ões)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={department.isActive ? "default" : "secondary"}
                        className={department.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {department.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(department)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {department.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desativar Departamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja desativar o departamento "{department.name}"? 
                                  Esta ação não pode ser desfeita e pode afetar usuários e solicitações vinculados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(department)}
                                  className="bg-red-600 hover:bg-red-700"
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
