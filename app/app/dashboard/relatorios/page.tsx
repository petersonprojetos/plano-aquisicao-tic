
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ReportsPage } from "@/components/reports/reports-page";

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Relatórios
        </h1>
        <p className="text-gray-600">
          Visualize estatísticas e relatórios de solicitações
        </p>
      </div>
      
      <ReportsPage />
    </div>
  );
}
