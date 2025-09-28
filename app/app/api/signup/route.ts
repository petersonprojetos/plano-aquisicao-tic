
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, departmentId } = body;

    // Validar campos obrigatórios com mensagens específicas
    const missingFields = [];
    if (!email?.trim()) missingFields.push("email");
    if (!password?.trim()) missingFields.push("password");  
    if (!name?.trim()) missingFields.push("name");
    if (!departmentId?.trim()) missingFields.push("departmentId");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "Todos os campos são obrigatórios", 
          missingFields,
          receivedData: { email: !!email, password: !!password, name: !!name, departmentId: !!departmentId }
        },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        departmentId,
        role: "USER",
        isActive: true,
      },
      include: {
        department: true
      }
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
