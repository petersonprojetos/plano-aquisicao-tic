

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { RequestFormBase } from "./request-form-base";

import { Edit } from "lucide-react";
import { toast } from "sonner";

import type { 
  RequestFormData
} from "@/lib/types";

interface EditRequestFormProps {
  requestId: string;
}

export function EditRequestForm({ requestId }: EditRequestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [savedRequestData, setSavedRequestData] = useState<any>(null);
  const [initialData, setInitialData] = useState<RequestFormData | undefined>(undefined);

  // Carregar dados do formulário e da solicitação
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const requestRes = await fetch(`/api/requests/${requestId}`);
        
        if (requestRes.ok) {
          const requestData = await requestRes.json();
          // Mapeamento robusto para garantir que os IDs sejam extraídos corretamente
          const mappedData = {
            ...requestData,
            items: requestData.items.map((item: any) => ({
              ...item,
              itemTypeId: item.itemType?.id || item.itemTypeId || "",
              itemCategoryId: item.itemCategory?.id || item.itemCategoryId || "",
              contractTypeId: item.contractType?.id || item.contractTypeId || "",
              acquisitionTypeMasterId: item.acquisitionTypeMaster?.id || item.acquisitionTypeMasterId || "",
            }))
          };
          setInitialData(mappedData);
        } else {
          const error = await requestRes.json();
          toast.error(error.error || "Erro ao carregar solicitação");
          router.push("/dashboard/solicitacoes");
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
        router.push("/dashboard/solicitacoes");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [requestId, router]);

  const handleFormSubmit = async (formData: RequestFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setSavedRequestData(result.request);
        setShowConfirmationModal(true);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar solicitação");
      }
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error);
      toast.error("Erro ao atualizar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationClose = (continueEditing: boolean) => {
    setShowConfirmationModal(false);
    if (continueEditing) {
      toast.success("Solicitação atualizada! Você pode continuar editando.");
    } else {
      router.push("/dashboard/solicitacoes");
    }
  };

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Carregando solicitação...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <RequestFormBase
        isEditing={true}
        initialData={initialData}
        onSubmit={handleFormSubmit}
        requestId={requestId}
      />

      {/* Modal de Confirmação */}
      {showConfirmationModal && savedRequestData && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          title="Solicitação Atualizada com Sucesso!"
          description={`A solicitação ${savedRequestData.requestNumber} foi atualizada com sucesso. O valor total é de R$ ${savedRequestData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Deseja continuar editando ou ir para suas solicitações?`}
          confirmText="Continuar Editando"
          type="success"
          showCancelOption={true}
          cancelOptionText="Ir para Minhas Solicitações"
          onConfirm={() => handleConfirmationClose(true)}
          onCancel={() => handleConfirmationClose(false)}
        />
      )}
    </div>
  );
}
