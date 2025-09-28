
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReopenRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestNumber: string;
  onSuccess?: () => void;
}

export function ReopenRequestModal({ 
  isOpen, 
  onClose, 
  requestId, 
  requestNumber, 
  onSuccess 
}: ReopenRequestModalProps) {
  const [reopenReason, setReopenReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reopenReason.trim()) {
      toast.error("Justificativa é obrigatória");
      return;
    }

    if (reopenReason.trim().length < 10) {
      toast.error("Justificativa deve ter pelo menos 10 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/requests/${requestId}/reopen`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reopenReason: reopenReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Solicitação reaberta com sucesso!");
        setReopenReason("");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || "Erro ao reabrir solicitação");
      }
    } catch (error) {
      console.error("Erro ao reabrir solicitação:", error);
      toast.error("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReopenReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            Reabrir Solicitação
          </DialogTitle>
          <DialogDescription>
            Você está prestes a reabrir a solicitação <strong>#{requestNumber}</strong>.
            Esta ação mudará o status da solicitação de "Aprovada" para "Reaberta" e
            exigirá nova autorização e aprovação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reopenReason">
              Justificativa para reabertura <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reopenReason"
              placeholder="Descreva detalhadamente o motivo da reabertura desta solicitação..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mínimo: 10 caracteres</span>
              <span>{reopenReason.length}/500</span>
            </div>
          </div>

          {reopenReason.trim() && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>Atenção:</strong> A reabertura desta solicitação irá notificar
                automaticamente o solicitante e o gestor responsável sobre a mudança
                de status e o motivo da reabertura.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reopenReason.trim() || reopenReason.trim().length < 10}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reabrindo...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Confirmar Reabertura
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
