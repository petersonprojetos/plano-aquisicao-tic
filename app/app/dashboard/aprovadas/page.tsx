
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApprovedRequestsPage } from "@/components/requests/approved-requests-page";

export default async function AprovadasPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["MANAGER", "ADMIN", "APPROVER"].includes(session.user.role)) {
    redirect("/dashboard");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Solicitações Aprovadas
        </h1>
        <p className="text-gray-600">
          Acompanhe as solicitações já aprovadas
        </p>
      </div>
      
      <ApprovedRequestsPage />
    </div>
  );
}
