
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ImportRow {
  codigo: string | number
  sigla: string
  nome: string
  departamento_pai_codigo?: string | number
  tipo_departamento_codigo?: string | number
  comandante?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  pais?: string
  orcamento_anual?: string | number
  observacoes?: string
  ativo: boolean | string
}

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem importar departamentos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado foi fornecido para importação' },
        { status: 400 }
      )
    }

    const importData: ImportRow[] = body.data
    const result: ImportResult = {
      success: true,
      total: importData.length,
      imported: 0,
      skipped: 0,
      errors: [],
      warnings: []
    }

    // Validar se existem códigos duplicados no próprio arquivo
    const codesInFile = importData.map(row => String(row.codigo).trim())
    const duplicateCodes = codesInFile.filter((code, index) => codesInFile.indexOf(code) !== index)
    
    if (duplicateCodes.length > 0) {
      return NextResponse.json({
        ...result,
        success: false,
        errors: [{
          row: -1,
          data: null,
          error: `Códigos duplicados encontrados no arquivo: ${duplicateCodes.join(', ')}`
        }]
      })
    }

    // Buscar todos os departamentos existentes
    const existingDepartments = await prisma.department.findMany({
      select: { code: true, name: true }
    })
    
    const existingCodes = new Set(existingDepartments.map(d => d.code))
    const existingNames = new Set(existingDepartments.map(d => d.name))

    // Array para armazenar departamentos que precisam de vínculo pai/filho
    const departmentsWithParents: Array<{
      rowNumber: number
      code: string
      parentCode: string
    }> = []

    // ETAPA 1: Criar todos os departamentos SEM vínculos hierárquicos
    for (let i = 0; i < importData.length; i++) {
      const rowNumber = i + 2 // Começa na linha 2 (linha 1 é o cabeçalho)
      const row = importData[i]

      try {
        // Validação dos campos obrigatórios
        if (!row.codigo || !row.nome) {
          result.errors.push({
            row: rowNumber,
            data: row,
            error: 'Código e nome são obrigatórios'
          })
          continue
        }

        const codigo = String(row.codigo).trim()
        const nome = String(row.nome).trim()

        // Verificar se código já existe
        if (existingCodes.has(codigo)) {
          result.errors.push({
            row: rowNumber,
            data: row,
            error: `Departamento com código '${codigo}' já existe`
          })
          continue
        }

        // Verificar se nome já existe
        if (existingNames.has(nome)) {
          result.errors.push({
            row: rowNumber,
            data: row,
            error: `Departamento com nome '${nome}' já existe`
          })
          continue
        }

        // Armazenar vínculo pai/filho para segunda etapa
        if (row.departamento_pai_codigo) {
          const parentCode = String(row.departamento_pai_codigo).trim()
          departmentsWithParents.push({
            rowNumber,
            code: codigo,
            parentCode
          })
        }

        // Validar tipo de departamento se especificado
        let typeId: string | null = null
        if (row.tipo_departamento_codigo) {
          const typeCode = String(row.tipo_departamento_codigo).trim()
          const deptType = await prisma.departmentType.findUnique({
            where: { code: typeCode },
            select: { id: true }
          })
          
          if (!deptType) {
            result.warnings.push({
              row: rowNumber,
              data: row,
              warning: `Tipo de departamento com código '${typeCode}' não foi encontrado - departamento será criado sem tipo`
            })
          } else {
            typeId = deptType.id
          }
        }

        // Processar orçamento anual
        let annualBudget: number | null = null
        if (row.orcamento_anual) {
          const budgetValue = String(row.orcamento_anual).replace(/[^\d.,-]/g, '').replace(',', '.')
          const parsedBudget = parseFloat(budgetValue)
          if (!isNaN(parsedBudget) && parsedBudget > 0) {
            annualBudget = parsedBudget
          }
        }

        // Processar status ativo
        let isActive = true
        if (row.ativo !== undefined) {
          if (typeof row.ativo === 'boolean') {
            isActive = row.ativo
          } else if (typeof row.ativo === 'string') {
            const ativoStr = row.ativo.toLowerCase().trim()
            isActive = ativoStr === 'true' || ativoStr === '1' || ativoStr === 'sim' || ativoStr === 'ativo'
          }
        }

        // Criar o departamento SEM parentId (será adicionado na segunda etapa)
        await prisma.department.create({
          data: {
            code: codigo,
            sigla_departamento: row.sigla ? String(row.sigla).trim() : null,
            name: nome,
            parentId: null, // Será definido na segunda etapa
            typeId,
            commander: row.comandante ? String(row.comandante).trim() : null,
            phone: row.telefone ? String(row.telefone).trim() : null,
            address: row.endereco ? String(row.endereco).trim() : null,
            city: row.cidade ? String(row.cidade).trim() : null,
            state: row.estado ? String(row.estado).trim() : null,
            zipCode: row.cep ? String(row.cep).trim() : null,
            country: row.pais ? String(row.pais).trim() : 'Brasil',
            annualBudget,
            observations: row.observacoes ? String(row.observacoes).trim() : null,
            isActive
          }
        })

        // Adicionar aos códigos e nomes existentes para próximas validações
        existingCodes.add(codigo)
        existingNames.add(nome)
        result.imported++

      } catch (error: any) {
        console.error(`Erro ao processar linha ${rowNumber}:`, error)
        result.errors.push({
          row: rowNumber,
          data: row,
          error: error.message || 'Erro desconhecido'
        })
      }
    }

    // ETAPA 2: Estabelecer vínculos hierárquicos (pai/filho)
    if (departmentsWithParents.length > 0) {
      // Buscar todos os departamentos recém-criados para fazer os vínculos
      const allDepartments = await prisma.department.findMany({
        select: { id: true, code: true }
      })
      
      const departmentMap = new Map<string, string>() // code -> id
      allDepartments.forEach(dept => {
        departmentMap.set(dept.code, dept.id)
      })

      for (const deptWithParent of departmentsWithParents) {
        try {
          const parentId = departmentMap.get(deptWithParent.parentCode)
          
          if (!parentId) {
            result.errors.push({
              row: deptWithParent.rowNumber,
              data: null,
              error: `Departamento pai com código '${deptWithParent.parentCode}' não foi encontrado`
            })
            // Como o departamento já foi criado sem pai, não contabilizamos como erro fatal
            continue
          }

          // Atualizar o departamento com o parentId correto
          await prisma.department.update({
            where: { code: deptWithParent.code },
            data: { parentId }
          })

        } catch (error: any) {
          console.error(`Erro ao vincular departamento ${deptWithParent.code} ao pai ${deptWithParent.parentCode}:`, error)
          result.warnings.push({
            row: deptWithParent.rowNumber,
            data: null,
            warning: `Erro ao vincular ao departamento pai '${deptWithParent.parentCode}': ${error.message}`
          })
        }
      }
    }

    result.skipped = result.total - result.imported - result.errors.length
    
    if (result.errors.length > 0) {
      result.success = false
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na importação de departamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
