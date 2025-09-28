
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { justification: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [exclusions, total] = await Promise.all([
      prisma.itemExclusion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      prisma.itemExclusion.count({ where }),
    ]);

    return NextResponse.json({
      exclusions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro detalhado ao buscar exclusões:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, justification } = body;

    if (!code || !name || !justification) {
      return NextResponse.json(
        { error: 'Código, nome e justificativa são obrigatórios' },
        { status: 400 }
      );
    }

    const exclusion = await prisma.itemExclusion.create({
      data: {
        code,
        name,
        justification,
      },
    });

    return NextResponse.json(exclusion);
  } catch (error: any) {
    console.error('Erro ao criar exclusão:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Código já existe' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
