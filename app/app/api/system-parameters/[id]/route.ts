
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, type, description, isActive } = body;

    // Verificar se o parâmetro existe
    const existingParameter = await prisma.systemParameters.findUnique({
      where: { id: params.id }
    });

    if (!existingParameter) {
      return NextResponse.json({ error: "Parâmetro não encontrado" }, { status: 404 });
    }

    // Verificar se o nome já está em uso por outro parâmetro
    if (name && name !== existingParameter.name) {
      const nameInUse = await prisma.systemParameters.findUnique({
        where: { name }
      });

      if (nameInUse) {
        return NextResponse.json({ error: "Nome já está em uso" }, { status: 409 });
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (name) updateData.name = name;
    if (value) updateData.value = value;
    if (type) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const parameter = await prisma.systemParameters.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(parameter);

  } catch (error) {
    console.error("Erro ao atualizar parâmetro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o parâmetro existe
    const parameter = await prisma.systemParameters.findUnique({
      where: { id: params.id }
    });

    if (!parameter) {
      return NextResponse.json({ error: "Parâmetro não encontrado" }, { status: 404 });
    }

    await prisma.systemParameters.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Parâmetro excluído com sucesso" });

  } catch (error) {
    console.error("Erro ao excluir parâmetro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
