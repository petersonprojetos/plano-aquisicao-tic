

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  X, 
  RotateCcw,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RequestActionsProps {
  requestId: string;
  requestStatus: string;
  managerStatus: string;
  approverStatus: string;
  requestNumber: string;
  canApprove: boolean;
}

export function RequestActions({ 
  requestId, 
  requestStatus, 
  managerStatus, 
  approverStatus,
  requestNumber,
  canApprove 
}: RequestActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const isManagerAction = requestStatus === "PENDING_MANAGER_APPROVAL" && managerStatus === "PENDING_AUTHORIZATION";
  const isApproverAction = requestStatus === "PENDING_APPROVAL" && managerStatus === "AUTHORIZE" && approverStatus === "PENDING_APPROVAL";

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const endpoint = isManagerAction 
        ? `/api/requests/${requestId}/manager-approve`
        : `/api/requests/${requestId}/approve`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao processar aprovação");
      }

      toast.success(
        isManagerAction 
          ? "Solicitação autorizada com sucesso!" 
          : "Solicitação aprovada com sucesso!"
      );
      
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar aprovação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Por favor, informe o motivo da rejeição");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isManagerAction 
        ? `/api/requests/${requestId}/manager-reject`
        : `/api/requests/${requestId}/reject`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar rejeição");
      }

      toast.success("Solicitação rejeitada com sucesso!");
      
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar rejeição");
    } finally {
      setIsLoading(false);
      setRejectionReason("");
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) {
      toast.error("Por favor, informe o motivo da devolução");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isManagerAction 
        ? `/api/requests/${requestId}/manager-return`
        : `/api/requests/${requestId}/return`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnReason: returnReason
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar devolução");
      }

      toast.success("Solicitação devolvida com sucesso!");
      
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar devolução");
    } finally {
      setIsLoading(false);
      setReturnReason("");
    }
  };

  if (!canApprove) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="p-3 md:p-4 md:p-6">
        <CardTitle className="text-sm md:text-base">Ações</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-4 md:p-6 pt-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
            <span className="text-xs sm:text-sm">
              {isManagerAction ? "Autorizar" : "Aprovar"}
            </span>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isLoading}
                className="flex-1 sm:flex-none h-8 sm:h-9 md:h-10" 
                size="sm"
              >
                <X className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Rejeitar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Rejeitar Solicitação</DialogTitle>
                <DialogDescription>
                  Rejeitar a solicitação #{requestNumber}. Por favor, informe o motivo da rejeição.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Descreva o motivo da rejeição..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleReject}
                  disabled={isLoading || !rejectionReason.trim()}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Rejeitar Solicitação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
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
                  Devolver a solicitação #{requestNumber} para correções. Por favor, informe o que precisa ser ajustado.
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
        </div>
      </CardContent>
    </Card>
  );
}

