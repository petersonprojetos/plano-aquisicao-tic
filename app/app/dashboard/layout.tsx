
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader session={session} />
      <div className="flex flex-col lg:flex-row">
        <DashboardNav session={session} />
        <main className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="container-responsive">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
