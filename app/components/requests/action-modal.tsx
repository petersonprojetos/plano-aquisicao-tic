
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RefreshCcw, AlertTriangle } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject' | 'return' | null;
  onConfirm: (action: 'approve' | 'reject' | 'return', reason?: string) => void;
  isManager?: boolean; // Indica se é uma ação de gestor (autorização) ou aprovador (aprovação)
}

export function ActionModal({ isOpen, onClose, action, onConfirm, isManager = false }: ActionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!action) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(action, reason);
      setReason("");
    } catch (error) {
      console.error("Erro na ação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Configurações diferentes para gestor vs aprovador
  const managerActionConfig = {
    approve: {
      title: "Autorizar Solicitação",
      description: "Tem certeza que deseja autorizar esta solicitação?",
      icon: CheckCircle,
      iconColor: "text-green-600",
      confirmText: "Autorizar",
      confirmClass: "bg-green-600 hover:bg-green-700",
      showReason: false,
      reasonLabel: "",
      reasonPlaceholder: "",
    },
    reject: {
      title: "Negar Solicitação",
      description: "Informe o motivo da negação:",
      icon: XCircle,
      iconColor: "text-red-600",
      confirmText: "Negar",
      confirmClass: "bg-red-600 hover:bg-red-700",
      showReason: true,
      reasonLabel: "Motivo da negação",
      reasonPlaceholder: "Descreva o motivo pela qual a solicitação está sendo negada...",
    },
    return: {
      title: "Devolver para Ajustes",
      description: "Informe o que precisa ser ajustado:",
      icon: RefreshCcw,
      iconColor: "text-orange-600",
      confirmText: "Devolver",
      confirmClass: "bg-orange-600 hover:bg-orange-700",
      showReason: true,
      reasonLabel: "Ajustes necessários",
      reasonPlaceholder: "Descreva os ajustes que o solicitante deve fazer...",
    },
  };

  const approverActionConfig = {
    approve: {
      title: "Aprovar Solicitação",
      description: "Tem certeza que deseja aprovar esta solicitação?",
      icon: CheckCircle,
      iconColor: "text-green-600",
      confirmText: "Aprovar",
      confirmClass: "bg-green-600 hover:bg-green-700",
      showReason: false,
      reasonLabel: "",
      reasonPlaceholder: "",
    },
    reject: {
      title: "Rejeitar Solicitação",
      description: "Informe o motivo da rejeição:",
      icon: XCircle,
      iconColor: "text-red-600",
      confirmText: "Rejeitar",
      confirmClass: "bg-red-600 hover:bg-red-700",
      showReason: true,
      reasonLabel: "Motivo da rejeição",
      reasonPlaceholder: "Descreva o motivo pela qual a solicitação está sendo rejeitada...",
    },
    return: {
      title: "Devolver para Ajustes",
      description: "Informe o que precisa ser ajustado:",
      icon: RefreshCcw,
      iconColor: "text-orange-600",
      confirmText: "Devolver",
      confirmClass: "bg-orange-600 hover:bg-orange-700",
      showReason: true,
      reasonLabel: "Ajustes necessários",
      reasonPlaceholder: "Descreva os ajustes que o solicitante deve fazer...",
    },
  };

  const actionConfig = isManager ? managerActionConfig : approverActionConfig;

  const config = actionConfig[action];
  const Icon = config.icon;
  const needsReason = config.showReason && !reason.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {config.description}
          </p>

          {config.showReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">{config.reasonLabel}</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={config.reasonPlaceholder}
                rows={4}
                className="resize-none"
              />
              {needsReason && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>O motivo é obrigatório</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={needsReason || isSubmitting}
            className={config.confirmClass}
          >
            {isSubmitting ? "Processando..." : config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
