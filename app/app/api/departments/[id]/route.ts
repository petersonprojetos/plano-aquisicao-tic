
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteContext {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erro ao buscar departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem editar departamentos.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Verifica se o departamento existe
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se já existe outro departamento com o mesmo código ou nome
    if (body.code || body.name) {
      const duplicateDepartment = await prisma.department.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(body.code ? [{ code: body.code }] : []),
                ...(body.name ? [{ name: body.name }] : [])
              ]
            }
          ]
        }
      })

      if (duplicateDepartment) {
        return NextResponse.json(
          { error: 'Já existe outro departamento com este código ou nome' },
          { status: 409 }
        )
      }
    }

    // Se foi especificado um departamento pai, verifica se existe e se não cria loop
    if (body.parentId && body.parentId !== existingDepartment.parentId) {
      if (body.parentId === params.id) {
        return NextResponse.json(
          { error: 'Um departamento não pode ser pai de si mesmo' },
          { status: 400 }
        )
      }

      const parentDepartment = await prisma.department.findUnique({
        where: { id: body.parentId }
      })
      
      if (!parentDepartment) {
        return NextResponse.json(
          { error: 'Departamento pai não encontrado' },
          { status: 400 }
        )
      }

      // Verifica se não vai criar loop na hierarquia
      const checkHierarchyLoop = async (currentId: string, targetParentId: string): Promise<boolean> => {
        if (currentId === targetParentId) return true
        
        const parent = await prisma.department.findUnique({
          where: { id: targetParentId },
          select: { parentId: true }
        })
        
        if (!parent?.parentId) return false
        return checkHierarchyLoop(currentId, parent.parentId)
      }

      if (await checkHierarchyLoop(params.id, body.parentId)) {
        return NextResponse.json(
          { error: 'Esta alteração criaria um loop na hierarquia de departamentos' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    
    if (body.code !== undefined) updateData.code = body.code
    if (body.sigla_departamento !== undefined) updateData.sigla_departamento = body.sigla_departamento || null
    if (body.name !== undefined) updateData.name = body.name
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null
    if (body.commander !== undefined) updateData.commander = body.commander || null
    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.address !== undefined) updateData.address = body.address || null
    if (body.city !== undefined) updateData.city = body.city || null
    if (body.state !== undefined) updateData.state = body.state || null
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode || null
    if (body.country !== undefined) updateData.country = body.country || 'Brasil'
    if (body.annualBudget !== undefined) updateData.annualBudget = body.annualBudget ? parseFloat(body.annualBudget) : null
    if (body.observations !== undefined) updateData.observations = body.observations || null
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const department = await prisma.department.update({
      where: { id: params.id },
      data: updateData,
      include: {
        parent: {
          select: { id: true, name: true, code: true }
        },
        children: {
          select: { id: true, name: true, code: true },
          where: { isActive: true }
        }
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem excluir departamentos.' },
        { status: 403 }
      )
    }

    // Verifica se o departamento existe
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            requests: true,
            children: true
          }
        }
      }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se o departamento tem usuários, solicitações ou subdepartamentos
    if (existingDepartment._count.users > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um departamento que possui usuários vinculados' },
        { status: 409 }
      )
    }

    if (existingDepartment._count.requests > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um departamento que possui solicitações vinculadas' },
        { status: 409 }
      )
    }

    if (existingDepartment._count.children > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um departamento que possui subdepartamentos. Remova ou transfira os subdepartamentos primeiro.' },
        { status: 409 }
      )
    }

    // Soft delete - marca como inativo ao invés de excluir
    const department = await prisma.department.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ 
      message: 'Departamento desativado com sucesso',
      department
    })
  } catch (error) {
    console.error('Erro ao excluir departamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
