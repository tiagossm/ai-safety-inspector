
import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  Share2, 
  Copy, 
  Download, 
  Mail, 
  QrCode, 
  CalendarClock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  List
} from "lucide-react";

interface ShareInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
}

interface ShareSettings {
  expirationEnabled: boolean;
  expirationDays: number;
  permissions: {
    canEdit: boolean;
    canOnlyView: boolean;
  };
}

export function ShareInspectionDialog({
  open,
  onOpenChange,
  inspectionId
}: ShareInspectionDialogProps) {
  const [activeTab, setActiveTab] = useState("link");
  const [shareUrl, setShareUrl] = useState("");
  const [settings, setSettings] = useState<ShareSettings>({
    expirationEnabled: true,
    expirationDays: 7,
    permissions: {
      canEdit: false,
      canOnlyView: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shareHistory, setShareHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Generate share link when dialog opens
  useEffect(() => {
    if (open && !shareUrl) {
      generateShareLink();
    }
    
    if (open) {
      fetchShareHistory();
    }
  }, [open]);
  
  const generateShareLink = async () => {
    if (!inspectionId) {
      toast.error("ID da inspeção não encontrado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Determine permissions array based on settings
      const permissions = [];
      if (settings.permissions.canOnlyView) permissions.push("read");
      if (settings.permissions.canEdit) permissions.push("edit");
      
      // Call our edge function to generate a secure token
      const { data, error } = await supabase.functions.invoke("generate-share-token", {
        body: {
          inspectionId,
          expirationDays: settings.expirationEnabled ? settings.expirationDays : 365,
          permissions
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setShareUrl(data.shareUrl);
    } catch (error: any) {
      console.error("Error generating share link:", error);
      toast.error("Erro ao gerar link de compartilhamento");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchShareHistory = async () => {
    if (!inspectionId) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("inspection_shares")
        .select(`
          id, 
          share_token, 
          created_at, 
          expires_at, 
          status,
          permissions,
          inspection_share_access_logs (
            id,
            access_time,
            client_ip,
            user_agent
          )
        `)
        .eq("inspection_id", inspectionId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setShareHistory(data || []);
    } catch (error) {
      console.error("Error fetching share history:", error);
    } finally {
      setIsLoadingHistory(false);
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
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Erro ao gerar QR Code para download");
      return;
    }
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    
    const downloadEl = document.createElement("a");
    downloadEl.href = pngUrl;
    downloadEl.download = `inspecao-qrcode-${inspectionId.substring(0, 8)}.png`;
    document.body.appendChild(downloadEl);
    downloadEl.click();
    document.body.removeChild(downloadEl);
  };
  
  const regenerateLink = () => {
    setShareUrl("");
    generateShareLink();
  };
  
  const handleExpirationChange = (checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      expirationEnabled: checked
    }));
  };
  
  const handleExpirationDaysChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      expirationDays: parseInt(value, 10)
    }));
  };
  
  const handlePermissionChange = (permission: "canEdit" | "canOnlyView", checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
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
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link">
            <div className="space-y-4">
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
                      checked={settings.expirationEnabled}
                      onCheckedChange={handleExpirationChange}
                      disabled={isLoading}
                    />
                  </div>
                  {settings.expirationEnabled && (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={settings.expirationDays.toString()}
                        onValueChange={handleExpirationDaysChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia</SelectItem>
                          <SelectItem value="3">3 dias</SelectItem>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="15">15 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm">de validade</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <div className="grid gap-2 flex-1">
                  <Label>Permissões</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="view-permission" 
                        checked={settings.permissions.canOnlyView}
                        onCheckedChange={(checked) => 
                          handlePermissionChange("canOnlyView", checked as boolean)
                        }
                      />
                      <Label htmlFor="view-permission" className="text-sm">
                        Somente visualização
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-permission" 
                        checked={settings.permissions.canEdit}
                        onCheckedChange={(checked) => 
                          handlePermissionChange("canEdit", checked as boolean)
                        }
                      />
                      <Label htmlFor="edit-permission" className="text-sm">
                        Permitir edição
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={regenerateLink}
                  disabled={isLoading}
                  className="gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Gerar novo link
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
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode">
            <div className="py-4 text-center">
              <div className="bg-white p-4 inline-block rounded-lg mb-4">
                {isLoading ? (
                  <div className="h-[200px] w-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <QRCode 
                    id="qr-code-canvas"
                    value={shareUrl || ' '} 
                    size={200} 
                    level="H"
                  />
                )}
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  onClick={downloadQrCode}
                  disabled={isLoading || !shareUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="py-2">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <List className="h-4 w-4" />
                Compartilhamentos anteriores
              </h3>
              
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando histórico...</p>
                </div>
              ) : shareHistory.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {shareHistory.map((share) => {
                    const createdAt = new Date(share.created_at);
                    const expiresAt = new Date(share.expires_at);
                    const isExpired = expiresAt < new Date();
                    const accessCount = share.inspection_share_access_logs?.length || 0;
                    
                    return (
                      <div 
                        key={share.id} 
                        className={`p-3 rounded-md border text-sm ${
                          isExpired ? 'bg-muted/50' : 'bg-muted/20'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{`Link ${share.id.substring(0, 5)}...`}</p>
                            <p className="text-xs text-muted-foreground">
                              Criado em {createdAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            isExpired 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isExpired ? 'Expirado' : 'Ativo'}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            Expira: {expiresAt.toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs">
                            {accessCount} acesso{accessCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Nenhum compartilhamento registrado
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <div className="text-xs text-muted-foreground">
            {activeTab === "link" && (
              <span>Os links podem ser configurados com diferentes permissões</span>
            )}
            {activeTab === "qrcode" && (
              <span>QR Code pode ser escaneado por qualquer dispositivo</span>
            )}
            {activeTab === "history" && (
              <span>Histórico mostra todos os compartilhamentos</span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
