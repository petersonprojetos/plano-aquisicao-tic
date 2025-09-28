
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsPage } from "@/components/settings/settings-page";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Configurações
        </h1>
        <p className="text-gray-600">
          Configurações administrativas do sistema - Acesso restrito a administradores
        </p>
      </div>
      
      <SettingsPage />
    </div>
  );
}
