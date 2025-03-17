
import { useState } from "react";
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddChecklistItemFormProps {
  checklistId: string;
  onAddItem: (newItem: Partial<ChecklistItem>) => void;
  lastOrder: number;
  questionTypes: { value: string; label: string }[];
}

export default function AddChecklistItemForm({ 
  checklistId, 
  onAddItem, 
  lastOrder, 
  questionTypes 
}: AddChecklistItemFormProps) {
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    pergunta: "",
    tipo_resposta: "sim/não",
    obrigatorio: true,
    ordem: lastOrder
  });

  const handleAddItem = () => {
    if (!newItem.pergunta) return;
    
    onAddItem(newItem);
    
    setNewItem({
      pergunta: "",
      tipo_resposta: "sim/não",
      obrigatorio: true,
      ordem: lastOrder + 1
    });
  };

  return (
    <div className="border rounded-md p-4 space-y-4 mt-6">
      <h3 className="text-lg font-medium">Adicionar Novo Item</h3>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-question">Pergunta</Label>
          <Input
            id="new-question"
            value={newItem.pergunta}
            onChange={(e) => setNewItem({...newItem, pergunta: e.target.value})}
            placeholder="Digite a pergunta..."
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-type">Tipo de Resposta</Label>
            <Select 
              value={newItem.tipo_resposta} 
              onValueChange={(value: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla") => 
                setNewItem({...newItem, tipo_resposta: value})
              }
            >
              <SelectTrigger id="new-type">
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
              id="new-required"
              checked={newItem.obrigatorio}
              onCheckedChange={(checked) => setNewItem({...newItem, obrigatorio: checked})}
            />
            <Label htmlFor="new-required">Obrigatório</Label>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleAddItem}
        disabled={!newItem.pergunta}
        className="w-full md:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Item
      </Button>
    </div>
  );
}
