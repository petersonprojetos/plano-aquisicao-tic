
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar todos os tipos de departamento
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search')

    let whereClause: any = {}

    if (!includeInactive) {
      whereClause.isActive = true
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { observations: { contains: search, mode: 'insensitive' } }
      ]
    }

    const departmentTypes = await prisma.departmentType.findMany({
      where: whereClause,
      orderBy: [
        { code: 'asc' }
      ],
      include: {
        _count: {
          select: {
            departments: true
          }
        }
      }
    })

    return NextResponse.json(departmentTypes)
  } catch (error) {
    console.error('Erro ao buscar tipos de departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar novo tipo de departamento
export async function POST(request: Request) {
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

    // Verificar se o código já existe
    const existingCode = await prisma.departmentType.findUnique({
      where: { code }
    })

    if (existingCode) {
      return NextResponse.json(
        { error: 'Código já existe' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const existingName = await prisma.departmentType.findUnique({
      where: { name }
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'Nome já existe' },
        { status: 400 }
      )
    }

    const departmentType = await prisma.departmentType.create({
      data: {
        code,
        name,
        observations,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        _count: {
          select: {
            departments: true
          }
        }
      }
    })

    return NextResponse.json(departmentType, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tipo de departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
