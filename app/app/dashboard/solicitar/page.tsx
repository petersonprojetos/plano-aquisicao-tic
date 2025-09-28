
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NewRequestForm } from "@/components/requests/new-request-form";

export default async function SolicitarPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Nova Solicitação
        </h1>
        <p className="text-gray-600">
          Crie uma nova solicitação de aquisição de TIC
        </p>
      </div>
      
      <NewRequestForm />
    </div>
  );
}
