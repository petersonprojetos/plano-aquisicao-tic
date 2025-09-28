
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const isManager = session?.user?.role === "MANAGER";
  const isApprover = session?.user?.role === "APPROVER";
  const isAdmin = session?.user?.role === "ADMIN";

  const getDashboardMessage = () => {
    if (isAdmin) return "Administre o sistema e acompanhe todos os processos";
    if (isManager) return "Gerencie solicitações do seu departamento";
    if (isApprover) return "Aprove solicitações e monitore processos";
    return "Crie e acompanhe suas solicitações de aquisição";
  };

  const getDashboardComponent = () => {
    if (isAdmin) return <ApproverDashboard />;
    if (isManager) return <ManagerDashboard />;
    if (isApprover) return <ApproverDashboard />;
    return <UserDashboard />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Bem-vindo, {session?.user?.name}!
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          {getDashboardMessage()}
        </p>
      </div>
      
      {getDashboardComponent()}
    </div>
  );
}
