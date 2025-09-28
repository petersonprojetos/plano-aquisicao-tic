
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PendingRequestsPage } from "@/components/requests/pending-requests-page";

export default async function PendentesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "APPROVER")) {
    redirect("/dashboard");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Solicitações Pendentes de Autorização
        </h1>
        <p className="text-gray-600">
          Revise e autorize as solicitações pendentes do seu departamento.
        </p>
      </div>
      
      <PendingRequestsPage 
        userRole={session?.user?.role} 
        userId={session?.user?.id} 
        status="PENDING_MANAGER_APPROVAL"
      />
    </div>
  );
}
