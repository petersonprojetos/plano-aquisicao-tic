
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RequestsPage } from "@/components/requests/requests-page";

export default async function SolicitacoesPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN" || session?.user?.role === "APPROVER"
            ? "Todas as Solicitações" 
            : "Minhas Solicitações"
          }
        </h1>
        <p className="text-gray-600">
          {session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN" || session?.user?.role === "APPROVER"
            ? "Visualize e gerencie todas as solicitações do sistema"
            : "Acompanhe o status das suas solicitações"
          }
        </p>
      </div>
      
      <RequestsPage 
        userRole={session?.user?.role} 
        userId={session?.user?.id}
        sessionUser={session?.user ? {
          id: session.user.id,
          name: session.user.name,
          role: session.user.role
        } : undefined}
      />
    </div>
  );
}
