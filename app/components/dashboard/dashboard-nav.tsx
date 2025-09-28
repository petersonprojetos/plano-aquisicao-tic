
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings,
  CheckCircle,
  Clock,
  Building2,
  Package2
} from "lucide-react";

interface DashboardNavProps {
  session: any;
}

export function DashboardNav({ session }: DashboardNavProps) {
  const pathname = usePathname();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isApprover = userRole === "APPROVER";

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Nova Solicitação",
      href: "/dashboard/solicitar",
      icon: Plus,
    },
    {
      title: "Minhas Solicitações",
      href: "/dashboard/solicitacoes",
      icon: FileText,
    },
    {
      title: "Relatórios",
      href: "/dashboard/relatorios",
      icon: BarChart3,
    },
  ];

  const managerNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Todas Solicitações",
      href: "/dashboard/solicitacoes",
      icon: FileText,
    },
    {
      title: "Pendente Autorização",
      href: "/dashboard/pendentes",
      icon: Clock,
    },
    {
      title: "Pendentes Aprovação",
      href: "/dashboard/pendentes-aprovacao",
      icon: Clock,
    },
    {
      title: "Aprovadas",
      href: "/dashboard/aprovadas",
      icon: CheckCircle,
    },
    {
      title: "Planejamento Anual",
      href: "/dashboard/planejamento",
      icon: Calendar,
    },
    {
      title: "Relatórios",
      href: "/dashboard/relatorios",
      icon: BarChart3,
    },
  ];

  // Itens específicos para administradores
  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Todas Solicitações",
      href: "/dashboard/solicitacoes",
      icon: FileText,
    },
    {
      title: "Pendente Autorização", 
      href: "/dashboard/pendentes",
      icon: Clock,
    },
    {
      title: "Pendentes Aprovação",
      href: "/dashboard/pendentes-aprovacao",
      icon: Clock,
    },
    {
      title: "Aprovadas",
      href: "/dashboard/aprovadas",
      icon: CheckCircle,
    },
    {
      title: "Planejamento Anual",
      href: "/dashboard/planejamento",
      icon: Calendar,
    },
    {
      title: "Departamentos",
      href: "/dashboard/departamentos",
      icon: Building2,
    },
    {
      title: "Itens",
      href: "/dashboard/itens",
      icon: Package2,
    },
    {
      title: "Relatórios",
      href: "/dashboard/relatorios",
      icon: BarChart3,
    },
    {
      title: "Configurações",
      href: "/dashboard/configuracoes",
      icon: Settings,
    },
  ];

  // Itens específicos para aprovadores
  const approverNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Todas Solicitações",
      href: "/dashboard/solicitacoes",
      icon: FileText,
    },
        {
      title: "Pendente Autorização",
      href: "/dashboard/pendentes",
      icon: Clock,
    },
    {
      title: "Pendentes Aprovação",
      href: "/dashboard/pendentes-aprovacao",
      icon: Clock,
    },
    {
      title: "Aprovadas",
      href: "/dashboard/aprovadas",
      icon: CheckCircle,
    },
    {
      title: "Planejamento Anual",
      href: "/dashboard/planejamento",
      icon: Calendar,
    },
    {
      title: "Relatórios",
      href: "/dashboard/relatorios",
      icon: BarChart3,
    },
  ];

  const navItems = isAdmin ? adminNavItems : (isApprover ? approverNavItems : (isManager ? managerNavItems : userNavItems));

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden xs:inline">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <aside className="hidden lg:block w-56 xl:w-64 bg-white border-r border-gray-200 h-[calc(100vh-3.5rem)] sticky top-14">
        <nav className="p-3 xl:p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4 xl:h-5 xl:w-5" />
                <span className="text-xs xl:text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
