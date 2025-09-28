
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ItemExclusion {
  id: string
  code: string
  name: string
  justification: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ExclusionsManagement() {
  const [exclusions, setExclusions] = useState<ItemExclusion[]>([])
  const [allExclusions, setAllExclusions] = useState<ItemExclusion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [selectedExclusion, setSelectedExclusion] = useState<ItemExclusion | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const { toast } = useToast()

  const fetchExclusions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/item-exclusions?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setAllExclusions(data.exclusions)
        setExclusions(data.exclusions)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as exclusões",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar exclusões",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExclusions()
  }, [])

  useEffect(() => {
    let filtered = allExclusions.filter(exclusion =>
      exclusion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exclusion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exclusion.justification.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!showInactive) {
      filtered = filtered.filter(exclusion => exclusion.isActive)
    }

    setExclusions(filtered)
  }, [searchTerm, showInactive, allExclusions])

  const handleView = (exclusion: ItemExclusion) => {
    setSelectedExclusion(exclusion)
    setViewModalOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      {/* Alerta informativo */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta lista contém itens que são explicitamente excluídos do rol de recursos de TIC 
          conforme a IN 94/2022 e outras normativas aplicáveis.
        </AlertDescription>
      </Alert>

      {/* Header e Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar exclusões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Mostrar inativos</Label>
          </div>
        </div>
      </div>

      {/* Lista de Exclusões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Itens Excluídos do Rol ({exclusions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exclusions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exclusions.map((exclusion) => (
                  <TableRow key={exclusion.id}>
                    <TableCell className="font-mono font-medium">
                      {exclusion.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {exclusion.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={exclusion.justification}>
                        {exclusion.justification}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={exclusion.isActive ? "default" : "secondary"}>
                        {exclusion.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(exclusion.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(exclusion)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma exclusão encontrada</p>
              {searchTerm && (
                <p className="text-sm">Tente ajustar os termos de pesquisa</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Detalhes da Exclusão
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o item excluído do rol de TIC
            </DialogDescription>
          </DialogHeader>
          {selectedExclusion && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Código
                  </Label>
                  <p className="font-mono text-lg font-medium">
                    {selectedExclusion.code}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge variant={selectedExclusion.isActive ? "default" : "secondary"}>
                      {selectedExclusion.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nome do Item
                </Label>
                <p className="text-lg font-medium mt-1">
                  {selectedExclusion.name}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Justificativa da Exclusão
                </Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm leading-relaxed">
                    {selectedExclusion.justification}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Adicionado em
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedExclusion.createdAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Última atualização
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedExclusion.updatedAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
