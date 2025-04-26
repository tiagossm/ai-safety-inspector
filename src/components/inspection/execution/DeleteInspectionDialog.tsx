
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  inspectionTitle: string;
  onDeleted: () => void;
}

export function DeleteInspectionDialog({
  open,
  onOpenChange,
  inspectionId,
  inspectionTitle,
  onDeleted
}: DeleteInspectionDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (confirmationText !== "EXCLUIR") return;
    
    setIsDeleting(true);
    
    try {
      // Simulate deletion API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Inspeção excluída com sucesso!");
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Error deleting inspection:", error);
      toast.error("Erro ao excluir inspeção. Tente novamente.");
    } finally {
      setIsDeleting(false);
      setConfirmationText("");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <Trash2 className="h-5 w-5 mr-2" />
            Excluir Inspeção
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. A inspeção será permanentemente excluída.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Você está prestes a excluir a inspeção: 
            <span className="font-medium block mt-1">{inspectionTitle || "Inspeção"}</span>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="confirm">
            Digite <span className="font-bold">EXCLUIR</span> para confirmar
          </Label>
          <Input
            id="confirm"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="border-destructive focus-visible:ring-destructive"
            autoComplete="off"
          />
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmationText !== "EXCLUIR" || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Excluir Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
