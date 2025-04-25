
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FloatingActionButtonsProps {
  saving: boolean;
  autoSave: boolean;
  onSave: () => Promise<void>;
  onComplete?: () => Promise<void>;
  isCompleted?: boolean;
  onReopen?: () => Promise<void>;
  onRefresh?: () => void;
}

export function FloatingActionButtons({
  saving,
  autoSave,
  onSave,
  onComplete,
  isCompleted,
  onReopen,
  onRefresh
}: FloatingActionButtonsProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 flex flex-col space-y-2"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isCompleted ? (
        <Button
          variant="outline"
          className="bg-white shadow-lg"
          onClick={onReopen}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <>Reabrir Inspeção</>
          )}
        </Button>
      ) : (
        <>
          <Button
            variant="default"
            className="shadow-lg"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>

          {onComplete && (
            <Button
              variant="default"
              className="shadow-lg"
              onClick={onComplete}
              disabled={saving}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </>
      )}

      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
          onClick={onRefresh}
          disabled={saving}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}
