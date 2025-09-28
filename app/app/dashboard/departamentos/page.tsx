
import { DepartmentsManager } from '@/components/departments/departments-manager'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DepartamentosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Apenas administradores podem gerenciar departamentos
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
        <p className="text-gray-600 text-center max-w-md">
          Apenas administradores podem acessar o gerenciamento de departamentos.
        </p>
      </div>
    )
  }

  return <DepartmentsManager />
}
