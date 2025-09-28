
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const parameters = await prisma.systemParameters.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(parameters);

  } catch (error) {
    console.error("Erro ao buscar parâmetros:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, type, description } = body;

    // Validações
    if (!name || !value || !type) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    // Verificar se o parâmetro já existe
    const existingParameter = await prisma.systemParameters.findUnique({
      where: { name }
    });

    if (existingParameter) {
      return NextResponse.json({ error: "Parâmetro já existe" }, { status: 409 });
    }

    const parameter = await prisma.systemParameters.create({
      data: {
        name,
        value,
        type,
        description
      }
    });

    return NextResponse.json(parameter, { status: 201 });

  } catch (error) {
    console.error("Erro ao criar parâmetro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
