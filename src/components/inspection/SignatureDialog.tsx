
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
        throw error;
      }
      
      toast.success("Signature saved successfully");
      
      if (onSignatureAdded) {
        onSignatureAdded();
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature");
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
            Add Signature
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Your Signature</DialogTitle>
          <DialogDescription>
            Sign the inspection document using your mouse or touch screen.
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
