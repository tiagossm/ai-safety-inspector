
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";
import { SignatureInput } from "./SignatureInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SignatureDialogProps {
  inspectionId: string;
  userId: string;
  userName?: string;
  onSignatureAdded?: () => void;
  trigger?: React.ReactNode;
}

export function SignatureDialog({
  inspectionId,
  userId,
  userName = "",
  onSignatureAdded,
  trigger,
}: SignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSignature = async (signatureData: string, signerName: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("inspection_signatures")
        .insert({
          inspection_id: inspectionId,
          signer_id: userId,
          signature_data: signatureData,
          signer_name: signerName
        });
        
      if (error) {
        console.error("Erro ao salvar assinatura:", error);
        throw error;
      }
      
      toast.success("Assinatura salva com sucesso");
      
      if (onSignatureAdded) {
        onSignatureAdded();
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      toast.error("Falha ao salvar assinatura. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileSignature className="mr-2 h-4 w-4" />
            Adicionar Assinatura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[500px]" 
        aria-describedby="signature-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Adicionar sua Assinatura</DialogTitle>
          <DialogDescription id="signature-dialog-description">
            Assine o documento de inspeção usando seu mouse ou tela sensível ao toque.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <SignatureInput 
            onSave={handleSaveSignature}
            defaultName={userName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
