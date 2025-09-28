
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnnualPlanningPage } from "@/components/planning/annual-planning-page";
import { prisma } from "@/lib/db";

async function getPlanningData(session: any) {
  // Filtro baseado no role do usuário
  const whereClause: any = {};

  // Se for usuário ou gestor, só mostra dados do seu departamento
  if ((session.user.role === "USER" || session.user.role === "MANAGER") && session.user.departmentId) {
    whereClause.id = session.user.departmentId;
  }

  // Buscar departamentos relevantes
  const departments = await prisma.department.findMany({
    where: whereClause,
    include: {
      parent: true,
      children: {
        include: {
          requests: {
            where: {
              status: {
                in: ["APPROVED", "COMPLETED"]
              }
            },
            include: {
              items: true
            }
          }
        }
      },
      requests: {
        where: {
          status: {
            in: ["APPROVED", "COMPLETED"]
          }
        },
        include: {
          items: true
        }
      }
    }
  });

  return departments.map(dept => {
    // Calcular valores utilizados
    const deptRequests = dept.requests || [];
    const childRequests = dept.children?.flatMap(child => child.requests || []) || [];
    const allRequests = [...deptRequests, ...childRequests];
    
    const totalUsed = allRequests.reduce((sum, req) => {
      const requestValue = req.items.reduce((itemSum, item) => itemSum + Number(item.totalValue || 0), 0);
      return sum + requestValue;
    }, 0);

    // Orçamento simulado (seria vindo de uma tabela de orçamentos)
    const estimatedBudget = dept.name.includes('TI') || dept.name.includes('Tecnologia') ? 500000 : 
                           dept.name.includes('RH') || dept.name.includes('Recursos Humanos') ? 300000 : 250000;

    return {
      id: dept.id,
      name: dept.name,
      budget: estimatedBudget,
      used: totalUsed,
      available: estimatedBudget - totalUsed,
      percentage: totalUsed > 0 ? (totalUsed / estimatedBudget) * 100 : 0
    };
  });
}

export default async function PlanejamentoPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["USER", "MANAGER", "ADMIN", "APPROVER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const planningData = await getPlanningData(session);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Planejamento Anual
        </h1>
        <p className="text-gray-600">
          Gerencie planos anuais de aquisição
        </p>
      </div>
      
      <AnnualPlanningPage planningData={planningData} userRole={session.user.role} />
    </div>
  );
}
