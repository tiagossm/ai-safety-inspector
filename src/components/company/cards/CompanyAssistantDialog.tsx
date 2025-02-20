
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface CompanyAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssistant: string;
  onAssistantChange: (value: string) => void;
  onAnalyze: () => void;
  assistants: Array<{ id: string, name: string }>;
  loading: boolean;
  analyzing: boolean;
  onLoad: () => Promise<void>;
}

export const CompanyAssistantDialog = ({
  open,
  onOpenChange,
  selectedAssistant,
  onAssistantChange,
  onAnalyze,
  assistants = [],
  loading,
  analyzing,
  onLoad
}: CompanyAssistantDialogProps) => {
  useEffect(() => {
    if (open) {
      onLoad().catch(() => {
        toast({
          title: "Erro ao carregar assistentes",
          description: "Verifique se a chave da API da OpenAI está configurada corretamente.",
          variant: "destructive"
        });
      });
    }
  }, [open, onLoad]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Assistente para Análise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select 
            disabled={loading} 
            value={selectedAssistant || "default"}
            onValueChange={onAssistantChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um assistente..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Usar modelo padrão</SelectItem>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={onAnalyze} 
              disabled={analyzing || loading}
            >
              Analisar NRs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
