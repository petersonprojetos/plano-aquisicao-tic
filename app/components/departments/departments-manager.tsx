
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DepartmentsList } from './departments-list'
import { DepartmentForm } from './department-form'
import { DepartmentDetail } from './department-detail'
import { DepartmentTypesManager } from './department-types-manager'
import { Building2, Settings } from 'lucide-react'

interface Department {
  id: string
  code: string
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
  createdAt: string
  updatedAt: string
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

type ViewMode = 'list' | 'form' | 'detail'

export function DepartmentsManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('departments')

  const handleCreate = () => {
    setSelectedDepartment(null)
    setViewMode('form')
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setViewMode('form')
  }

  const handleView = (department: Department) => {
    setSelectedDepartment(department)
    setViewMode('detail')
  }

  const handleSave = () => {
    setViewMode('list')
    setSelectedDepartment(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedDepartment(null)
  }

  const handleEditFromDetail = () => {
    setViewMode('form')
  }

  const handleCloseDetail = () => {
    setViewMode('list')
    setSelectedDepartment(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Gestão de Departamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('departments')}
                className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'departments' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Departamentos
              </button>
              <button
                onClick={() => setActiveTab('types')}
                className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'types'
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Tipos de Departamento
              </button>
            </div>
            
            {activeTab === 'departments' && (
              <div>
                {viewMode === 'list' && (
                  <DepartmentsList
                    key={refreshKey}
                    onEdit={handleEdit}
                    onView={handleView}
                    onCreate={handleCreate}
                  />
                )}

                {viewMode === 'form' && (
                  <DepartmentForm
                    department={selectedDepartment || undefined}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                )}

                {viewMode === 'detail' && selectedDepartment && (
                  <DepartmentDetail
                    department={selectedDepartment}
                    onEdit={handleEditFromDetail}
                    onClose={handleCloseDetail}
                  />
                )}
              </div>
            )}
            
            {activeTab === 'types' && (
              <div>
                <DepartmentTypesManager />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
