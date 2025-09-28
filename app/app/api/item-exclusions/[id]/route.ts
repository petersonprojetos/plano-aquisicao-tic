
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exclusion = await prisma.itemExclusion.findUnique({
      where: { id: params.id },
    });

    if (!exclusion) {
      return NextResponse.json(
        { error: 'Exclusão não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(exclusion);
  } catch (error: any) {
    console.error('Erro ao buscar exclusão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { code, name, justification, isActive } = body;

    if (!code || !name || !justification) {
      return NextResponse.json(
        { error: 'Código, nome e justificativa são obrigatórios' },
        { status: 400 }
      );
    }

    const exclusion = await prisma.itemExclusion.update({
      where: { id: params.id },
      data: {
        code,
        name,
        justification,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(exclusion);
  } catch (error: any) {
    console.error('Erro ao atualizar exclusão:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Código já existe' },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Exclusão não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.itemExclusion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Exclusão removida com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover exclusão:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Exclusão não encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
