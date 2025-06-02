
import { useState, useEffect } from "react";
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Image, Video, Mic, Info, Scale, Link2, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { 
  StandardResponseType, 
  convertToDatabaseType,
  TYPES_REQUIRING_OPTIONS 
} from "@/types/responseTypes";

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
    permite_audio: false,
    permite_video: false,
    permite_foto: true,
    hint: "",
    weight: 1
  });

  const [showOptions, setShowOptions] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  // Converte o tipo do banco para o frontend para exibição
  const currentFrontendType = (() => {
    switch (newItem.tipo_resposta) {
      case "sim/não": return "yes_no";
      case "texto": return "text";
      case "numérico": return "numeric";
      case "seleção múltipla": return "multiple_choice";
      case "foto": return "photo";
      case "assinatura": return "signature";
      case "data": return "date";
      case "hora": return "time";
      case "data e hora": return "datetime";
      default: return "text";
    }
  })();

  // Verifica se o tipo atual requer opções
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(currentFrontendType as StandardResponseType);

  // Atualiza o showOptions quando o tipo de resposta muda
  useEffect(() => {
    setShowOptions(requiresOptions);
  }, [requiresOptions]);

  const handleResponseTypeChange = (frontendType: StandardResponseType) => {
    const dbType = convertToDatabaseType(frontendType);
    setNewItem({...newItem, tipo_resposta: dbType});
    
    // Limpa opções se o novo tipo não precisar
    if (!TYPES_REQUIRING_OPTIONS.includes(frontendType)) {
      setOptions([]);
    }
  };

  const handleAddItem = () => {
    if (!newItem.pergunta) return;
    
    const itemToAdd = {
      ...newItem,
      opcoes: options.length > 0 ? options : null
    };
    
    onAddItem(itemToAdd);
    
    // Reset form
    setNewItem({
      pergunta: "",
      tipo_resposta: "sim/não",
      obrigatorio: true,
      ordem: lastOrder + 1,
      permite_audio: false,
      permite_video: false,
      permite_foto: true,
      hint: "",
      weight: 1
    });
    setOptions([]);
    setNewOption("");
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setOptions([...options, newOption]);
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  return (
    <Card className="border rounded-md mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Adicionar Novo Item</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para adicionar um novo item ao checklist
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-question">Pergunta</Label>
            <Textarea
              id="new-question"
              value={newItem.pergunta}
              onChange={(e) => setNewItem({...newItem, pergunta: e.target.value})}
              placeholder="Digite a pergunta..."
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="new-hint">Dica/Instrução</Label>
            <Textarea
              id="new-hint"
              value={newItem.hint || ""}
              onChange={(e) => setNewItem({...newItem, hint: e.target.value})}
              placeholder="Instruções para o inspetor (opcional)..."
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-type">Tipo de Resposta</Label>
              <ResponseTypeSelector
                value={currentFrontendType as StandardResponseType}
                onChange={handleResponseTypeChange}
                showDescriptions={true}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-weight">Peso da Pergunta</Label>
              <Input
                id="new-weight"
                type="number"
                min="1"
                max="10"
                value={newItem.weight || 1}
                onChange={(e) => setNewItem({...newItem, weight: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          {showOptions && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-md">
              <Label>Opções de Resposta</Label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {options.map((option, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {option}
                    <button 
                      onClick={() => handleRemoveOption(i)}
                      className="ml-1 text-xs opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nova opção..."
                  className="flex-1"
                />
                <Button
                  size="sm"
                  type="button" 
                  variant="secondary"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-required">Item obrigatório</Label>
                <Switch
                  id="new-required"
                  checked={newItem.obrigatorio}
                  onCheckedChange={(checked) => setNewItem({...newItem, obrigatorio: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="new-permite-foto"
                  className="flex items-center"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Permitir Foto
                </Label>
                <Switch
                  id="new-permite-foto"
                  checked={newItem.permite_foto}
                  onCheckedChange={(checked) => setNewItem({...newItem, permite_foto: checked})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="new-permite-video"
                  className="flex items-center"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Permitir Vídeo
                </Label>
                <Switch
                  id="new-permite-video"
                  checked={newItem.permite_video}
                  onCheckedChange={(checked) => setNewItem({...newItem, permite_video: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="new-permite-audio"
                  className="flex items-center"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Permitir Áudio
                </Label>
                <Switch
                  id="new-permite-audio"
                  checked={newItem.permite_audio}
                  onCheckedChange={(checked) => setNewItem({...newItem, permite_audio: checked})}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleAddItem}
            disabled={!newItem.pergunta}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
