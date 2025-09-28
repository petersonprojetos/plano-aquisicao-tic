
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon, UserPlus } from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  code: string;
}

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsDepartmentsLoading(true);
        const response = await fetch("/api/departments");
        if (response.ok) {
          const data = await response.json();
          setDepartments(data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar departamentos:", error);
      } finally {
        setIsDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validar campos obrigatórios
    if (!formData.name?.trim()) {
      setError("Nome é obrigatório");
      setIsLoading(false);
      return;
    }

    if (!formData.email?.trim()) {
      setError("Email é obrigatório");
      setIsLoading(false);
      return;
    }

    if (!formData.password?.trim()) {
      setError("Senha é obrigatória");
      setIsLoading(false);
      return;
    }

    if (!formData.departmentId?.trim()) {
      setError("Departamento é obrigatório. Aguarde os departamentos carregarem ou tente recarregar a página.");
      setIsLoading(false);
      return;
    }

    // Validação adicional para garantir que departmentId é válido
    const isValidDepartment = departments.some(dept => dept.id === formData.departmentId);
    if (!isValidDepartment) {
      setError("Por favor, selecione um departamento válido da lista.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        departmentId: formData.departmentId,
      };

      console.log('Enviando dados:', payload); // Para debug

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Erro ao criar conta");
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setError("Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          placeholder="Seu nome completo"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          placeholder="seu@email.com"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Departamento</Label>
        <Select
          value={formData.departmentId}
          onValueChange={(value) => handleChange("departmentId", value)}
          disabled={isLoading || isDepartmentsLoading}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                isDepartmentsLoading 
                  ? "Carregando departamentos..." 
                  : departments.length === 0 
                    ? "Nenhum departamento disponível"
                    : "Selecione seu departamento"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {departments?.filter(dept => dept?.id)?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </SelectItem>
            ))}
            {departments.length === 0 && !isDepartmentsLoading && (
              <SelectItem value="no-departments" disabled>
                Nenhum departamento encontrado
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
            placeholder="Sua senha (mín. 6 caracteres)"
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
            placeholder="Confirme sua senha"
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>
      
      <div className="text-center text-sm text-gray-600">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
          Entre aqui
        </Link>
      </div>
    </form>
  );
}
