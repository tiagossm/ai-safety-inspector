
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, Trash2 } from "lucide-react";

interface ChecklistItemsListProps {
  items: ChecklistItem[];
  onItemChange: (updatedItem: ChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  questionTypes: { value: string; label: string }[];
}

export default function ChecklistItemsList({ 
  items, 
  onItemChange, 
  onDeleteItem, 
  questionTypes 
}: ChecklistItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Nenhum item adicionado</h3>
        <p className="text-muted-foreground mt-1">
          Adicione perguntas a este checklist usando o formulário abaixo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="border rounded-md p-4 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-grow space-y-4">
            <div className="grid gap-2">
              <Label>Pergunta</Label>
              <Input
                value={item.pergunta}
                onChange={(e) => onItemChange({
                  ...item,
                  pergunta: e.target.value
                })}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Resposta</Label>
                <Select 
                  value={item.tipo_resposta} 
                  onValueChange={(value: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla") => 
                    onItemChange({
                      ...item,
                      tipo_resposta: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 md:justify-end md:h-10">
                <Switch
                  id={`required-${item.id}`}
                  checked={item.obrigatorio}
                  onCheckedChange={(checked) => onItemChange({
                    ...item,
                    obrigatorio: checked
                  })}
                />
                <Label htmlFor={`required-${item.id}`}>Obrigatório</Label>
              </div>
            </div>
          </div>
          
          <div className="flex md:flex-col justify-end gap-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDeleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
