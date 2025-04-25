
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react"; // Changed from default import to named import

interface QRCodeGeneratorProps {
  inspectionId: string;
  size?: number;
  label?: string;
}

export function QRCodeGenerator({ inspectionId, size = 250, label = "Gerar QR Code" }: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState("");
  
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/inspections/${inspectionId}/shared?token=${token}`;
  
  const generateToken = () => {
    // Generate a simple token (in real-world, should use a JWT or secure token from backend)
    // In this simple implementation we're just creating a random string
    const newToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setToken(newToken);
  };
  
  const handleOpen = () => {
    if (!token) {
      generateToken();
    }
  };
  
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `inspecao-${inspectionId}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("QR Code baixado com sucesso");
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado para a área de transferência");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleOpen}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code da Inspeção</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          <QRCodeCanvas 
            id="qr-code"
            value={shareUrl} 
            size={size} 
            level="H" 
            includeMargin={true}
          />
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Escaneie o código QR para acessar a inspeção compartilhada
          </p>
          
          <div className="flex gap-3 mt-4">
            <Button onClick={downloadQRCode} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            
            <Button onClick={copyShareLink} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
