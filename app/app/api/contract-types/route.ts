
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const contractTypes = await prisma.contractType.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: [
        { name: 'asc' }
      ]
    })

    return NextResponse.json(contractTypes)
  } catch (error) {
    console.error('Erro ao buscar tipos de contrato:', error)
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
        { error: 'Acesso negado. Apenas administradores podem criar tipos de contrato.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validação dos campos obrigatórios
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: 'Código e nome do tipo de contrato são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já existe um tipo de contrato com o mesmo código ou nome
    const existingContractType = await prisma.contractType.findFirst({
      where: {
        OR: [
          { code: body.code },
          { name: body.name }
        ]
      }
    })

    if (existingContractType) {
      return NextResponse.json(
        { error: 'Já existe um tipo de contrato com este código ou nome' },
        { status: 409 }
      )
    }

    const contractType = await prisma.contractType.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json(contractType, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tipo de contrato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
