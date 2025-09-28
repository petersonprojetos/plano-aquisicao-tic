
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar tipo de departamento por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const departmentType = await prisma.departmentType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            departments: true
          }
        }
      }
    })

    if (!departmentType) {
      return NextResponse.json(
        { error: 'Tipo de departamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(departmentType)
  } catch (error) {
    console.error('Erro ao buscar tipo de departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar tipo de departamento
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { code, name, observations, isActive } = body

    // Validações básicas
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Código e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se existe
    const existingDepartmentType = await prisma.departmentType.findUnique({
      where: { id: params.id }
    })

    if (!existingDepartmentType) {
      return NextResponse.json(
        { error: 'Tipo de departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o código já existe (exceto para o próprio registro)
    const existingCode = await prisma.departmentType.findUnique({
      where: { code }
    })

    if (existingCode && existingCode.id !== params.id) {
      return NextResponse.json(
        { error: 'Código já existe' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe (exceto para o próprio registro)
    const existingName = await prisma.departmentType.findUnique({
      where: { name }
    })

    if (existingName && existingName.id !== params.id) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    const departmentType = await prisma.departmentType.update({
      where: { id: params.id },
      data: {
        code,
        name,
        observations,
        isActive
      },
      include: {
        _count: {
          select: {
            departments: true
          }
        }
      }
    })

    return NextResponse.json(departmentType)
  } catch (error) {
    console.error('Erro ao atualizar tipo de departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Desativar tipo de departamento
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se existe
    const existingDepartmentType = await prisma.departmentType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            departments: true
          }
        }
      }
    })

    if (!existingDepartmentType) {
      return NextResponse.json(
        { error: 'Tipo de departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há departamentos vinculados
    if (existingDepartmentType._count.departments > 0) {
      return NextResponse.json(
        { error: 'Não é possível desativar tipo com departamentos vinculados' },
        { status: 400 }
      )
    }

    // Desativar em vez de excluir
    const departmentType = await prisma.departmentType.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Tipo de departamento desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao desativar tipo de departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
