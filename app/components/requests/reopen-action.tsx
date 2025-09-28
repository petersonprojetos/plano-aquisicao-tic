
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ReopenRequestModal } from "./reopen-request-modal";
import { useSession } from "next-auth/react";

interface ReopenActionProps {
  requestId: string;
  requestNumber: string;
  onSuccess?: () => void;
  className?: string;
}

export function ReopenAction({
  requestId,
  requestNumber,
  onSuccess,
  className = ""
}: ReopenActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession() || {};

  // Só mostrar o botão para aprovadores
  if (session?.user?.role !== "APPROVER") {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={`text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 ${className}`}
      >
        <RotateCcw className="mr-1 md:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        <span className="text-xs sm:text-sm">Reabrir</span>
      </Button>

      <ReopenRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={requestId}
        requestNumber={requestNumber}
        onSuccess={onSuccess}
      />
    </>
  );
}
