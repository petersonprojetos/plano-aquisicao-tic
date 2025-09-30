
"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User, Bell } from "lucide-react";
import { NotificationsDropdown } from "./notifications-dropdown";

interface DashboardHeaderProps {
  session: any;
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleProfile = () => {
    // Por enquanto mostra um alerta, depois pode navegar para uma página de perfil
    alert("Funcionalidade de perfil será implementada em breve");
  };

  const handleSettings = () => {
    if (session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER") {
      router.push("/dashboard/configuracoes");
    } else {
      alert("Você não tem permissão para acessar as configurações");
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase()
      ?.slice(0, 2) || "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-responsive">
        <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-blue-600 truncate">
              <span className="hidden xs:inline">Plano de Aquisição TIC</span>
              <span className="xs:hidden">TIC</span>
            </h1>
            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
              {session?.user?.department}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <NotificationsDropdown />

            <div className="text-xs sm:text-sm text-gray-600 hidden lg:block">
             {/*session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN" 
                ? "Gestor de Aquisição" 
                : "Usuário do Departamento"*/}
                {session?.user?.name}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full"
                  onClick={(e) => e.preventDefault()}
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                    <AvatarFallback className="text-xs sm:text-sm">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 sm:w-52 md:w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-none truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 sm:hidden">
                      {session?.user?.department}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile}>
                  <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
