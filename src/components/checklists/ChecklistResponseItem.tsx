
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
  HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChecklistResponseItemProps {
  item: ChecklistItem;
  onResponseChange: (itemId: string, value: any) => void;
  index: number;
}

export function ChecklistResponseItem({ item, onResponseChange, index }: ChecklistResponseItemProps) {
  const [comment, setComment] = useState("");
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  
  const handleSaveComment = () => {
    // Aqui você pode implementar a lógica para salvar o comentário
    console.log("Saving comment:", comment);
    setShowCommentDialog(false);
    toast.success("Comentário salvo com sucesso!");
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
          value={item.resposta || ""}
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
          value={item.resposta || ""}
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
          
          {item.permite_foto && (
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              <span>Foto</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Adicione o Toast faltante
import { toast } from "sonner";
