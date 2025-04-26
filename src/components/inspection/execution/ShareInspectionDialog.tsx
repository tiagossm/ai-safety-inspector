
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Share2, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";

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
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(addDays(new Date(), 7));
  
  // Generate a share link
  const generateShareLink = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate a token
    setTimeout(() => {
      const token = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/share/${inspectionId}?token=${token}`;
      
      if (expirationEnabled && expirationDate) {
        // Add expiration to the link if enabled
        const expiry = expirationDate.getTime();
        setShareLink(`${link}&expires=${expiry}`);
      } else {
        setShareLink(link);
      }
      
      setIsGenerating(false);
    }, 800);
  };
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copiado para a área de transferência");
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Share using Web Share API if available
  const shareWithNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Compartilhar Inspeção',
        text: 'Acesse esta inspeção compartilhada',
        url: shareLink,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      copyToClipboard();
    }
  };
  
  React.useEffect(() => {
    if (open && !shareLink) {
      generateShareLink();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar Inspeção
          </DialogTitle>
          <DialogDescription>
            Compartilhe um link seguro para visualização e preenchimento da inspeção
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-link">Link para compartilhamento</Label>
              <div className="flex space-x-2">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={copyToClipboard}
                  variant="outline"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={expirationEnabled} 
                  onCheckedChange={setExpirationEnabled} 
                  id="expiration"
                />
                <Label htmlFor="expiration">Definir data de expiração</Label>
              </div>
              
              {expirationEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Data de Expiração</Label>
                  <DatePicker
                    date={expirationDate}
                    setDate={setExpirationDate}
                    disabled={(date) => date < new Date()}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-4">
            <div className="flex justify-center p-4 bg-white">
              <QRCode value={shareLink || ' '} size={200} />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Escaneie este QR Code para acessar a inspeção
            </p>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1"
          >
            Fechar
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              type="button"
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copiar
            </Button>
            <Button 
              type="button"
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={shareWithNative}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
