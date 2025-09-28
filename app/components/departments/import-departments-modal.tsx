
"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: Array<{
    row: number
    data: any
    error: string
  }>
  warnings: Array<{
    row: number
    data: any
    warning: string
  }>
}

interface ImportDepartmentsModalProps {
  onImportComplete: () => void
}

export function ImportDepartmentsModal({ onImportComplete }: ImportDepartmentsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Arquivo Inválido',
          description: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
          variant: 'destructive'
        })
        return
      }

      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const processExcelFile = useCallback((file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // Converter para JSON com header na primeira linha
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: null
          })
          
          if (jsonData.length < 2) {
            reject(new Error('O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados'))
            return
          }

          // Primeira linha são os cabeçalhos
          const headers = jsonData[0] as string[]
          const requiredHeaders = ['codigo', 'nome']
          
          const missingHeaders = requiredHeaders.filter(header => 
            !headers.some(h => h?.toLowerCase() === header.toLowerCase())
          )
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Colunas obrigatórias não encontradas: ${missingHeaders.join(', ')}`))
            return
          }

          // Converter dados para objetos
          const processedData = []
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            if (row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
              const rowObj: any = {}
              headers.forEach((header, index) => {
                if (header) {
                  const value = row[index]
                  rowObj[header.toLowerCase()] = value
                }
              })
              processedData.push(rowObj)
            }
          }

          resolve(processedData)
        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel: ' + (error as Error).message))
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsBinaryString(file)
    })
  }, [])

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setImportResult(null)

    try {
      // Etapa 1: Processar arquivo Excel
      setUploadProgress(20)
      
      const data = await processExcelFile(file)
      setUploadProgress(40)

      // Etapa 2: Enviar dados para a API (criação dos departamentos)
      const response = await fetch('/api/departments/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      })

      setUploadProgress(80)

      const result = await response.json()
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação')
      }

      setImportResult(result)

      if (result.success) {
        toast({
          title: 'Importação Concluída!',
          description: `${result.imported} departamento(s) importado(s) com sucesso.`
        })
        onImportComplete()
      } else {
        toast({
          title: 'Importação com Erros',
          description: `${result.imported} importados, ${result.errors.length} com erro.`,
          variant: 'destructive'
        })
      }

    } catch (error: any) {
      console.error('Erro na importação:', error)
      toast({
        title: 'Erro na Importação',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setFile(null)
    setImportResult(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const downloadTemplate = () => {
    const templateData = [
      ['codigo', 'sigla', 'nome', 'departamento_pai_codigo', 'tipo_departamento_codigo', 'comandante', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'pais', 'orcamento_anual', 'observacoes', 'ativo'],
      ['10000001', 'EX-01', 'Departamento Exemplo', '', '', 'João Silva', '(11) 99999-9999', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Brasil', '500000', 'Departamento exemplo para importação', 'true']
    ]

    const ws = XLSX.utils.aoa_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Departamentos')
    XLSX.writeFile(wb, 'template_importacao_departamentos.xlsx')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Importar Departamentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Importar Departamentos via Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Template de Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Baixe o template com a estrutura correta para importação de departamentos.
              </p>
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-xs text-blue-700">
                  <strong>💡 Processo de Importação:</strong><br />
                  1️⃣ <strong>Etapa 1:</strong> Todos os departamentos são criados primeiro<br />
                  2️⃣ <strong>Etapa 2:</strong> Os vínculos hierárquicos (pai/filho) são estabelecidos<br />
                  <em>Isso garante que departamentos filhos possam ser vinculados mesmo se aparecem antes dos pais na planilha.</em>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📁 Selecionar Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="excel-file">Arquivo Excel (.xlsx, .xls)</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>

              {file && (
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Arquivo selecionado:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processando importação...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                    <div className="text-sm text-gray-600">Importados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                    <div className="text-sm text-gray-600">Erros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{importResult.warnings.length}</div>
                    <div className="text-sm text-gray-600">Avisos</div>
                  </div>
                </div>

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Erros ({importResult.errors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {importResult.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription className="text-sm">
                            <Badge variant="outline" className="mr-2">
                              Linha {error.row}
                            </Badge>
                            {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                      Avisos ({importResult.warnings.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {importResult.warnings.map((warning, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <Badge variant="outline" className="mr-2">
                              Linha {warning.row}
                            </Badge>
                            {warning.warning}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? 'Fechar' : 'Cancelar'}
            </Button>
            <div className="space-x-2">
              {!importResult && (
                <Button 
                  onClick={handleImport} 
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Departamentos
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
