
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, Share2, Info } from "lucide-react";

interface ShareDialogSectionProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sharableLink: string;
  copyToClipboard: () => void;
  checklistData: any;
  formData: any;
}

export default function ShareDialogSection({
  open,
  setOpen,
  sharableLink,
  copyToClipboard,
  checklistData,
  formData,
}: ShareDialogSectionProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Inspeção</DialogTitle>
          <DialogDescription>
            Compartilhe esta inspeção com outros responsáveis ou envie o link para dispositivos móveis.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input value={sharableLink} readOnly className="w-full" />
          </div>
          <Button size="sm" variant="secondary" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copiar</span>
            <ClipboardCopy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center p-4">
          <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
            <Info className="h-8 w-8 text-gray-400" />
            <span className="sr-only">QR Code</span>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
          {navigator.share && (
            <Button
              variant="default"
              onClick={() => {
                navigator.share({
                  title: "Inspeção compartilhada",
                  text: `Inspeção ${checklistData?.title || ""} - Empresa: ${formData.companyData?.fantasy_name || ""}`,
                  url: sharableLink
                }).catch(err => console.error("Erro ao compartilhar:", err));
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
