
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { QrCode, Download, Share2 } from "lucide-react";
import { QRCode } from "react-qr-code";
import { toast } from "sonner";

interface ShareQRCodeButtonProps {
  inspectionId: string;
}

export function ShareQRCodeButton({ inspectionId }: ShareQRCodeButtonProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrValue, setQrValue] = useState("");
  
  const generateQRCodeValue = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate a token
    setTimeout(() => {
      const token = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/share/${inspectionId}?token=${token}`;
      setQrValue(link);
      setIsGenerating(false);
    }, 800);
  };
  
  const handleOpen = () => {
    setOpen(true);
    generateQRCodeValue();
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleOpen}
        className="flex items-center text-sm"
        size="sm"
      >
        <QrCode className="h-4 w-4 mr-2" />
        Gerar QR Code
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR Code da Inspeção
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR code para acessar a inspeção compartilhada
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {isGenerating ? (
              <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">Gerando QR Code...</span>
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg">
                <QRCode value={qrValue || ' '} size={200} />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  // In reality, this would generate and download a PNG
                  toast.success("QR Code baixado!");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button 
                type="button"
                variant="default"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'QR Code da Inspeção',
                      text: 'Acesse esta inspeção compartilhada',
                      url: qrValue,
                    })
                    .catch((error) => console.log('Error sharing:', error));
                  } else {
                    navigator.clipboard.writeText(qrValue);
                    toast.success("Link copiado para a área de transferência");
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
