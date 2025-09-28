

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ItemsManagement } from "@/components/items/items-management";

export default async function ItensPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Itens
        </h1>
        <p className="text-gray-600">
          Gerencie categorias, tipos e itens do sistema
        </p>
      </div>
      
      <ItemsManagement />
    </div>
  );
}
