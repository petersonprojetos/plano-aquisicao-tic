"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequestFormBase } from "./request-form-base";
import type { RequestFormData } from "@/lib/types";

export function NewRequestForm() {
  const router = useRouter();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [savedRequestData, setSavedRequestData] = useState<RequestFormData | null>(null);

  const handleFormSubmit = async (formData: RequestFormData) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setSavedRequestData(result.request);
        setShowConfirmationModal(true);
        toast.success("Solicitação criada com sucesso!");
        router.push("/dashboard/solicitacoes");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar solicitação");
      }
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      toast.error("Erro ao criar solicitação");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <RequestFormBase onSubmit={handleFormSubmit} />
    </div>
  );
}