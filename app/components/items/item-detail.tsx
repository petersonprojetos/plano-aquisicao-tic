

"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ItemCategory {
  id: string
  code: string
  name: string
}

interface ItemType {
  id: string
  code: string
  name: string
}

interface Item {
  id: string
  code: string
  description: string
  specifications?: string
  model?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: ItemCategory
  type: ItemType
}

interface ItemDetailProps {
  item: Item
}

export function ItemDetail({ item }: ItemDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {item.description}
        </h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono">
            {item.code}
          </Badge>
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Código</label>
              <p className="font-mono font-medium">{item.code}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p>{item.description}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{item.category.name}</Badge>
                <span className="text-sm text-muted-foreground">({item.category.code})</span>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{item.type.name}</Badge>
                <span className="text-sm text-muted-foreground">({item.type.code})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {item.model && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                <p>{item.model}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {item.specifications && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Especificações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{item.specifications}</p>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                <p>{new Date(item.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
                <p>{new Date(item.updatedAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
