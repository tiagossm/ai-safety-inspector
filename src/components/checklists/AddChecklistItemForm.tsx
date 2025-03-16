
import { useState } from "react";
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Mic, Video } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
    ordem: lastOrder,
    permite_foto: true,
    permite_audio: true,
    permite_video: true,
    opcoes: []
  });

  const handleAddItem = () => {
    if (!newItem.pergunta) return;
    
    const itemToAdd = {...newItem};
    
    // Handle multiple choice options
    if (itemToAdd.tipo_resposta === "seleção múltipla" && (!itemToAdd.opcoes || itemToAdd.opcoes.length === 0)) {
      itemToAdd.opcoes = ["Opção 1", "Opção 2"];
    } else if (itemToAdd.tipo_resposta !== "seleção múltipla") {
      itemToAdd.opcoes = null;
    }
    
    onAddItem(itemToAdd);
    
    setNewItem({
      pergunta: "",
      tipo_resposta: "sim/não",
      obrigatorio: true,
      ordem: lastOrder + 1,
      permite_foto: true,
      permite_audio: true,
      permite_video: true,
      opcoes: []
    });
  };

  const renderMultipleOptions = () => {
    if (newItem.tipo_resposta !== "seleção múltipla") return null;
    
    return (
      <div className="mt-2 space-y-2">
        <Label>Opções:</Label>
        <div className="space-y-2">
          {(newItem.opcoes || []).map((opcao, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={opcao}
                onChange={(e) => {
                  const newOpcoes = [...(newItem.opcoes || [])];
                  newOpcoes[idx] = e.target.value;
                  setNewItem({
                    ...newItem,
                    opcoes: newOpcoes
                  });
                }}
                placeholder={`Opção ${idx + 1}`}
              />
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => {
                  const newOpcoes = [...(newItem.opcoes || [])];
                  newOpcoes.splice(idx, 1);
                  setNewItem({
                    ...newItem,
                    opcoes: newOpcoes
                  });
                }}
              >
                <span className="sr-only">Remover</span>
                -
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newOpcoes = [...(newItem.opcoes || []), ""];
              setNewItem({
                ...newItem,
                opcoes: newOpcoes
              });
            }}
          >
            Adicionar Opção
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="border rounded-md p-4 space-y-4 mt-6">
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
              value={newItem.tipo_resposta as string} 
              onValueChange={(value: any) => {
                setNewItem({
                  ...newItem, 
                  tipo_resposta: value,
                  opcoes: value === "seleção múltipla" ? ["Opção 1", "Opção 2"] : null
                });
              }}
            >
              <SelectTrigger id="new-type">
                <SelectValue />
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

        {renderMultipleOptions()}
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-photo"
              checked={newItem.permite_foto}
              onCheckedChange={(checked) => setNewItem({...newItem, permite_foto: checked})}
            />
            <Label htmlFor="allow-photo" className="flex items-center">
              <Camera className="h-4 w-4 mr-1" />
              Permitir Foto
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-audio"
              checked={newItem.permite_audio}
              onCheckedChange={(checked) => setNewItem({...newItem, permite_audio: checked})}
            />
            <Label htmlFor="allow-audio" className="flex items-center">
              <Mic className="h-4 w-4 mr-1" />
              Permitir Áudio
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allow-video"
              checked={newItem.permite_video}
              onCheckedChange={(checked) => setNewItem({...newItem, permite_video: checked})}
            />
            <Label htmlFor="allow-video" className="flex items-center">
              <Video className="h-4 w-4 mr-1" />
              Permitir Vídeo
            </Label>
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
    </Card>
  );
}
