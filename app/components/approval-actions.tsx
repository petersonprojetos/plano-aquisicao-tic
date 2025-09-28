

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ApprovalActionsProps {
  requestId: string;
  requestNumber: string;
}

export function ApprovalActions({ requestId, requestNumber }: ApprovalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao processar aprovação");
      }

      toast.success("Solicitação aprovada com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar aprovação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      toast.error("Por favor, informe o motivo da devolução");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: returnReason
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar devolução");
      }

      toast.success("Solicitação devolvida com sucesso!");
      setIsReturnDialogOpen(false);
      setReturnReason("");
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar devolução");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleApprove}
        disabled={isLoading}
        className="flex-1 sm:flex-none h-8 sm:h-9 md:h-10"
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        )}
        <span className="text-xs sm:text-sm">Aprovar</span>
      </Button>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            disabled={isLoading}
            className="flex-1 sm:flex-none h-8 sm:h-9 md:h-10"
            size="sm"
          >
            <RotateCcw className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Devolver</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Devolver Solicitação</DialogTitle>
            <DialogDescription>
              Devolver a solicitação #{requestNumber} para ajustes. Por favor, informe o motivo da devolução.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Motivo da Devolução</Label>
              <Textarea
                id="return-reason"
                placeholder="Descreva o que precisa ser corrigido..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleReturn}
              disabled={isLoading || !returnReason.trim()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Devolver Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

