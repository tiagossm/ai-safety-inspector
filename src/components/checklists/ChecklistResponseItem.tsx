import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChecklistItem } from "@/types/checklist";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Info, 
  Camera, 
  Smile, 
  Frown, 
  Meh,
  CheckCircle,
  XCircle,
  HelpCircle,
  Image,
  Video,
  Mic
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MediaCaptureButton } from "@/components/media/MediaCaptureButton";
import { FileUploadButton } from "@/components/media/FileUploadButton";

interface ChecklistResponseItemProps {
  item: ChecklistItem;
  onResponseChange: (itemId: string, value: any) => void;
  index: number;
}

export function ChecklistResponseItem({ item, onResponseChange, index }: ChecklistResponseItemProps) {
  const [comment, setComment] = useState("");
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  
  const handleSaveComment = () => {
    // Aqui você pode implementar a lógica para salvar o comentário
    console.log("Saving comment:", comment);
    setShowCommentDialog(false);
    toast.success("Comentário salvo com sucesso!");
  };

  const handleMediaCaptured = (mediaData: any) => {
    console.log("Media captured:", mediaData);
    if (mediaData && mediaData.url) {
      setAttachments([...attachments, mediaData.url]);
      setShowMediaDialog(false);
      toast.success("Mídia anexada com sucesso!");
    }
  };
  
  const renderYesNoOptions = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          variant={item.resposta === "sim" ? "default" : "outline"}
          className={`flex items-center gap-2 ${item.resposta === "sim" ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => onResponseChange(item.id, "sim")}
        >
          <CheckCircle className="h-4 w-4" />
          <span>SIM</span>
        </Button>
        <Button
          variant={item.resposta === "não" ? "default" : "outline"}
          className={`flex items-center gap-2 ${item.resposta === "não" ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => onResponseChange(item.id, "não")}
        >
          <XCircle className="h-4 w-4" />
          <span>NÃO</span>
        </Button>
        <Button
          variant={item.resposta === "n/a" ? "default" : "outline"}
          className={`flex items-center gap-2 ${item.resposta === "n/a" ? "bg-gray-500 hover:bg-gray-600" : ""}`}
          onClick={() => onResponseChange(item.id, "n/a")}
        >
          <HelpCircle className="h-4 w-4" />
          <span>N/A</span>
        </Button>
      </div>
    );
  };
  
  const renderEmotionOptions = () => {
    return (
      <div className="flex gap-2 mt-2">
        <Button
          variant={item.resposta === "bom" ? "default" : "outline"}
          size="lg"
          className={`flex-1 ${item.resposta === "bom" ? "bg-green-500 hover:bg-green-600" : ""}`}
          onClick={() => onResponseChange(item.id, "bom")}
        >
          <Smile className="h-8 w-8" />
        </Button>
        <Button
          variant={item.resposta === "regular" ? "default" : "outline"}
          size="lg"
          className={`flex-1 ${item.resposta === "regular" ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
          onClick={() => onResponseChange(item.id, "regular")}
        >
          <Meh className="h-8 w-8" />
        </Button>
        <Button
          variant={item.resposta === "ruim" ? "default" : "outline"}
          size="lg"
          className={`flex-1 ${item.resposta === "ruim" ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={() => onResponseChange(item.id, "ruim")}
        >
          <Frown className="h-8 w-8" />
        </Button>
      </div>
    );
  };
  
  const renderTextInput = () => {
    return (
      <div className="mt-2">
        <Textarea
          value={item.resposta as string || ""}
          onChange={(e) => onResponseChange(item.id, e.target.value)}
          placeholder="Digite sua resposta..."
          rows={3}
        />
      </div>
    );
  };
  
  const renderNumberInput = () => {
    return (
      <div className="mt-2">
        <Input
          type="number"
          value={item.resposta as string || ""}
          onChange={(e) => onResponseChange(item.id, e.target.value)}
          placeholder="Digite um valor numérico..."
        />
      </div>
    );
  };
  
  const renderSelectOptions = () => {
    if (!item.opcoes || item.opcoes.length === 0) {
      return <p className="text-sm text-muted-foreground mt-2">Nenhuma opção disponível</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {item.opcoes.map((option, i) => (
          <Button
            key={i}
            variant={item.resposta === option ? "default" : "outline"}
            onClick={() => onResponseChange(item.id, option)}
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };
  
  const renderResponseInput = () => {
    switch (item.tipo_resposta) {
      case "sim/não":
        return renderYesNoOptions();
      case "numérico":
        return renderNumberInput();
      case "texto":
        return renderTextInput();
      case "seleção múltipla":
        return renderSelectOptions();
      default:
        return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {item.tipo_resposta}</p>;
    }
  };
  
  // Determina a cor do cartão com base na resposta ou requisito
  const getCardColor = () => {
    if (!item.resposta) {
      return item.obrigatorio ? "border-l-amber-500" : "";
    }
    
    if (item.tipo_resposta === "sim/não") {
      if (item.resposta === "sim") return "border-l-green-500";
      if (item.resposta === "não") return "border-l-red-500";
      return "border-l-gray-500";
    }
    
    return "";
  };

  const renderMediaAttachments = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="mt-4 border-t pt-2">
        <h4 className="text-sm font-medium mb-2">Arquivos anexados</h4>
        <div className="flex flex-wrap gap-2">
          {attachments.map((url, i) => {
            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
            const isVideo = url.match(/\.(mp4|webm|avi|mov|wmv|mkv)$/i);
            const isAudio = url.match(/\.(mp3|wav|ogg|m4a)$/i);
            
            return (
              <div key={i} className="w-16 h-16 relative border rounded-md overflow-hidden">
                {isImage ? (
                  <img src={url} alt="Anexo" className="w-full h-full object-cover" />
                ) : isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <Video className="h-8 w-8" />
                  </div>
                ) : isAudio ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <Mic className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <Image className="h-8 w-8" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`overflow-hidden border border-l-4 ${getCardColor()} mb-4`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{index + 1}.</span>
            <h3 className="font-medium">{item.pergunta}</h3>
            {item.obrigatorio && <Badge variant="outline" className="text-red-500">*</Badge>}
          </div>
          
          {item.hint && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Instruções</DialogTitle>
                </DialogHeader>
                <p className="text-sm">{item.hint}</p>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {renderResponseInput()}
        
        <div className="flex justify-end gap-2 mt-4">
          <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>Comentar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Comentário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Área:</p>
                  <p className="text-sm">Checklist</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Item:</p>
                  <p className="text-sm">{item.pergunta}</p>
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Digite seu comentário..."
                  rows={5}
                />
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSaveComment}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                <span>Foto</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Mídia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Capturar Mídia</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <MediaCaptureButton 
                      type="photo" 
                      onMediaCaptured={handleMediaCaptured} 
                      className="col-span-1"
                    />
                    <MediaCaptureButton 
                      type="video" 
                      onMediaCaptured={handleMediaCaptured} 
                      className="col-span-1"
                    />
                    <MediaCaptureButton 
                      type="audio" 
                      onMediaCaptured={handleMediaCaptured} 
                      className="col-span-1"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-2">Enviar Arquivo</h3>
                  <FileUploadButton 
                    onFileUploaded={handleMediaCaptured}
                    accept="image/*,video/*,audio/*"
                    buttonText="Enviar Arquivo"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {renderMediaAttachments()}
      </div>
    </Card>
  );
}
