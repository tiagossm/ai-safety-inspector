
import React, { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Share2, 
  Copy, 
  Download, 
  Mail, 
  QrCode, 
  CalendarClock,
  Loader2
} from "lucide-react";

interface ShareInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
}

export function ShareInspectionDialog({
  open,
  onOpenChange,
  inspectionId
}: ShareInspectionDialogProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  
  // Generate share link when dialog opens
  React.useEffect(() => {
    if (open && !shareUrl) {
      generateShareLink();
    }
  }, [open]);
  
  const generateShareLink = async () => {
    if (!inspectionId) {
      toast.error("ID da inspeção não encontrado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API call to generate a token
      // For now, we'll simulate a short delay and generate a fake URL
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const token = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/share/${inspectionId}?token=${token}`;
      
      setShareUrl(link);
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error("Erro ao gerar link de compartilhamento");
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado para a área de transferência");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Erro ao copiar para a área de transferência");
    }
  };
  
  const sendEmail = () => {
    const subject = encodeURIComponent("Link para preenchimento de inspeção");
    const body = encodeURIComponent(`Acesse o link para preencher a inspeção: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const downloadQrCode = () => {
    toast.info("Funcionalidade de download de QR Code em desenvolvimento");
  };
  
  const regenerateLink = () => {
    setShareUrl("");
    generateShareLink();
  };
  
  const handleExpirationChange = (checked: boolean) => {
    setExpirationEnabled(checked);
    
    // If enabling expiration, update the share link
    if (checked && shareUrl) {
      regenerateLink();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar Inspeção
          </DialogTitle>
        </DialogHeader>
        
        {showQrCode ? (
          <div className="py-6">
            <div className="bg-white p-4 rounded-md flex items-center justify-center">
              {isLoading ? (
                <div className="h-[200px] w-[200px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <QRCode value={shareUrl || "waiting"} size={200} />
              )}
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadQrCode}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="share-link">Link de compartilhamento</Label>
              <div className="flex mt-1">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1 pr-10"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={copyToClipboard}
                  disabled={isLoading || !shareUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compartilhe este link para permitir o preenchimento da inspeção
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <div className="grid gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiration-switch">Expiração do link</Label>
                  <Switch
                    id="expiration-switch"
                    checked={expirationEnabled}
                    onCheckedChange={handleExpirationChange}
                    disabled={isLoading}
                  />
                </div>
                {expirationEnabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(Number(e.target.value))}
                      className="w-20"
                      disabled={isLoading}
                    />
                    <span className="text-sm">dias</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={regenerateLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Gerar novo link"
            )}
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowQrCode(!showQrCode)}
              disabled={isLoading}
            >
              {showQrCode ? (
                "Voltar ao link"
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Code
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={sendEmail}
              disabled={isLoading || !shareUrl}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
