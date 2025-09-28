
"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Info, Edit, Trash2, Loader2 } from 'lucide-react'
import { DepartmentTypeForm } from './department-type-form'

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

export function DepartmentTypesManager() {
  const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<DepartmentType | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchDepartmentTypes()
  }, [refreshKey])

  const fetchDepartmentTypes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/department-types')
      if (response.ok) {
        const data = await response.json()
        setDepartmentTypes(data)
      } else {
        console.error('Erro ao carregar tipos de departamento')
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de departamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingType(null)
    setShowForm(true)
  }

  const handleEdit = (departmentType: DepartmentType) => {
    setEditingType(departmentType)
    setShowForm(true)
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingType(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingType(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este tipo de departamento?')) {
      try {
        const response = await fetch(`/api/department-types/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setRefreshKey(prev => prev + 1)
        } else {
          alert('Erro ao excluir tipo de departamento')
        }
      } catch (error) {
        console.error('Erro ao excluir tipo de departamento:', error)
        alert('Erro ao excluir tipo de departamento')
      }
    }
  }

  if (showForm) {
    return (
      <DepartmentTypeForm
        departmentType={editingType || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tipos de Departamento</h2>
          <p className="text-sm text-gray-600">
            Gerencie os tipos de departamentos disponíveis no sistema
          </p>
        </div>
        <Button onClick={handleCreate} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tipos Cadastrados ({departmentTypes.length})
          </CardTitle>
          <CardDescription>
            Lista de tipos de departamentos disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando tipos de departamento...</span>
            </div>
          ) : departmentTypes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Settings className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-500 mb-4">
                Nenhum tipo de departamento cadastrado
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Tipo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.code}</TableCell>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {type._count.departments} departamento{type._count.departments !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? 'default' : 'secondary'}>
                        {type.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                          disabled={type._count.departments > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
