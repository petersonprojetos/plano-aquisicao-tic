
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Permite acesso público para listagem de departamentos (usado no cadastro)
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Não autorizado' },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const departments = await prisma.department.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, code: true },
          where: { isActive: true }
        },
        _count: {
          select: {
            users: true,
            requests: true
          }
        }
      },
      orderBy: [
        { parentId: { sort: 'asc', nulls: 'first' } },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar departamentos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validação dos campos obrigatórios
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: 'Código e nome do departamento são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já existe um departamento com o mesmo código ou nome
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { code: body.code },
          { name: body.name }
        ]
      }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Já existe um departamento com este código ou nome' },
        { status: 409 }
      )
    }

    // Se foi especificado um departamento pai, verifica se existe
    if (body.parentId) {
      const parentDepartment = await prisma.department.findUnique({
        where: { id: body.parentId }
      })
      
      if (!parentDepartment) {
        return NextResponse.json(
          { error: 'Departamento pai não encontrado' },
          { status: 400 }
        )
      }
    }

    const department = await prisma.department.create({
      data: {
        code: body.code,
        sigla_departamento: body.sigla_departamento || null,
        name: body.name,
        parentId: body.parentId || null,
        commander: body.commander || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        country: body.country || 'Brasil',
        annualBudget: body.annualBudget ? parseFloat(body.annualBudget) : null,
        observations: body.observations || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        }
      }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
