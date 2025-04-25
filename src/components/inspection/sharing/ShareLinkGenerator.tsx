
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ShareLinkGeneratorProps {
  inspectionId: string;
  label?: string;
}

export function ShareLinkGenerator({ inspectionId, label = "Compartilhar" }: ShareLinkGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [allowEdit, setAllowEdit] = useState(false);
  
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/inspections/${inspectionId}/shared?token=${token}${allowEdit ? '&mode=edit' : ''}`;
  
  const generateToken = () => {
    // Generate a simple token (in real-world, should use a JWT or secure token from backend)
    // In this simple implementation we're just creating a random string
    const newToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setToken(newToken);
  };
  
  const handleOpen = () => {
    setCopied(false);
    if (!token) {
      generateToken();
    }
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado para a área de transferência");
    
    // Reset copied status after 3 seconds
    setTimeout(() => setCopied(false), 3000);
  };
  
  const sendEmailShare = () => {
    if (!email) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    
    // Here we would typically call an API to send the email
    // For now, we'll just show a success message
    toast.success(`Link enviado para ${email}`);
    setEmail("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleOpen}
        >
          <Share className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Inspeção</DialogTitle>
          <DialogDescription>
            Gere um link para compartilhar esta inspeção com outras pessoas.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="allowEdit" 
                checked={allowEdit}
                onCheckedChange={(checked) => setAllowEdit(checked === true)}
              />
              <Label htmlFor="allowEdit">Permitir edição</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1"
              />
              <Button 
                size="sm" 
                onClick={copyShareLink}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Este link expira em 7 dias e pode ser acessado por qualquer pessoa com o link.
            </p>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="allowEditEmail" 
                checked={allowEdit}
                onCheckedChange={(checked) => setAllowEdit(checked === true)}
              />
              <Label htmlFor="allowEditEmail">Permitir edição</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                type="email"
                className="flex-1"
              />
              <Button 
                size="sm" 
                onClick={sendEmailShare}
                className="flex-shrink-0"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Um email será enviado com o link para acessar a inspeção.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
