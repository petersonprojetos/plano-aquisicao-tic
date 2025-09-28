
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ParameterType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const defaultParameters = [
      {
        name: "primary_color",
        value: "#2563eb",
        type: ParameterType.COLOR,
        description: "Cor primária do sistema (azul)"
      },
      {
        name: "secondary_color",
        value: "#10b981",
        type: ParameterType.COLOR,
        description: "Cor secundária do sistema (verde)"
      },
      {
        name: "accent_color",
        value: "#f59e0b",
        type: ParameterType.COLOR,
        description: "Cor de destaque do sistema (laranja)"
      },
      {
        name: "danger_color",
        value: "#ef4444",
        type: ParameterType.COLOR,
        description: "Cor de perigo/erro (vermelho)"
      },
      {
        name: "system_logo",
        value: "/images/logo.png",
        type: ParameterType.IMAGE,
        description: "Logotipo principal do sistema"
      },
      {
        name: "system_name",
        value: "Plano de Aquisição de TIC",
        type: ParameterType.STRING,
        description: "Nome do sistema"
      },
      {
        name: "session_timeout_minutes",
        value: "30",
        type: ParameterType.NUMBER,
        description: "Tempo limite de sessão em minutos"
      },
      {
        name: "auto_approval_enabled",
        value: "false",
        type: ParameterType.BOOLEAN,
        description: "Habilitar aprovação automática para valores baixos"
      },
      {
        name: "auto_approval_limit",
        value: "1000",
        type: ParameterType.NUMBER,
        description: "Valor limite para aprovação automática (em reais)"
      },
      {
        name: "email_notifications_enabled",
        value: "true",
        type: ParameterType.BOOLEAN,
        description: "Habilitar notificações por email"
      },
      {
        name: "system_theme",
        value: "light",
        type: ParameterType.STRING,
        description: "Tema padrão do sistema (light/dark)"
      },
      {
        name: "max_file_upload_mb",
        value: "10",
        type: ParameterType.NUMBER,
        description: "Tamanho máximo de arquivo para upload (em MB)"
      },
      {
        name: "company_name",
        value: "Ministério da Defesa",
        type: ParameterType.STRING,
        description: "Nome da organização"
      },
      {
        name: "support_email",
        value: "suporte@exemplo.gov.br",
        type: ParameterType.STRING,
        description: "Email de suporte técnico"
      },
      {
        name: "system_version",
        value: "1.0.0",
        type: ParameterType.STRING,
        description: "Versão atual do sistema"
      }
    ];

    // Criar parâmetros que não existem ainda
    const created = [];
    for (const param of defaultParameters) {
      const existing = await prisma.systemParameters.findUnique({
        where: { name: param.name }
      });

      if (!existing) {
        const created_param = await prisma.systemParameters.create({
          data: param
        });
        created.push(created_param);
      }
    }

    return NextResponse.json({
      message: `${created.length} parâmetros padrão criados com sucesso`,
      created: created.length
    });

  } catch (error) {
    console.error("Erro ao criar parâmetros padrão:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
