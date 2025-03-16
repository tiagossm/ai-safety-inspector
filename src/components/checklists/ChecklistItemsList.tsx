
import { useState } from "react";
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, Trash2, MoveVertical, Camera, Mic, Video } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ChecklistItemsListProps {
  items: ChecklistItem[];
  onItemChange: (updatedItem: ChecklistItem) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItems?: (items: ChecklistItem[]) => void;
  questionTypes: { value: string; label: string }[];
}

export default function ChecklistItemsList({ 
  items, 
  onItemChange, 
  onDeleteItem,
  onReorderItems, 
  questionTypes 
}: ChecklistItemsListProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !onReorderItems) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    // Update order values
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      ordem: index
    }));
    
    onReorderItems(updatedItems);
  };

  const handleDeleteClick = (id: string) => {
    setShowConfirmDelete(id);
  };

  const confirmDelete = (id: string) => {
    onDeleteItem(id);
    setShowConfirmDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(null);
  };

  const renderMediaOptions = (item: ChecklistItem) => {
    return (
      <div className="flex gap-2 mt-2">
        <div className="flex items-center space-x-1">
          <Switch
            id={`allow-photo-${item.id}`}
            checked={item.permite_foto}
            onCheckedChange={(checked) => onItemChange({
              ...item,
              permite_foto: checked
            })}
          />
          <Label htmlFor={`allow-photo-${item.id}`} className="text-xs">
            <Camera className="h-3 w-3 mr-1 inline" />
            Foto
          </Label>
        </div>
        
        <div className="flex items-center space-x-1">
          <Switch
            id={`allow-audio-${item.id}`}
            checked={item.permite_audio}
            onCheckedChange={(checked) => onItemChange({
              ...item,
              permite_audio: checked
            })}
          />
          <Label htmlFor={`allow-audio-${item.id}`} className="text-xs">
            <Mic className="h-3 w-3 mr-1 inline" />
            Áudio
          </Label>
        </div>
        
        <div className="flex items-center space-x-1">
          <Switch
            id={`allow-video-${item.id}`}
            checked={item.permite_video}
            onCheckedChange={(checked) => onItemChange({
              ...item,
              permite_video: checked
            })}
          />
          <Label htmlFor={`allow-video-${item.id}`} className="text-xs">
            <Video className="h-3 w-3 mr-1 inline" />
            Vídeo
          </Label>
        </div>
      </div>
    );
  };

  const renderMultipleOptions = (item: ChecklistItem) => {
    if (item.tipo_resposta !== "seleção múltipla") return null;
    
    return (
      <div className="mt-2 border-t pt-2">
        <Label className="mb-2 block">Opções:</Label>
        <div className="space-y-2">
          {(item.opcoes || []).map((opcao, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={opcao}
                onChange={(e) => {
                  const newOpcoes = [...(item.opcoes || [])];
                  newOpcoes[idx] = e.target.value;
                  onItemChange({
                    ...item,
                    opcoes: newOpcoes
                  });
                }}
                placeholder={`Opção ${idx + 1}`}
              />
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => {
                  const newOpcoes = [...(item.opcoes || [])];
                  newOpcoes.splice(idx, 1);
                  onItemChange({
                    ...item,
                    opcoes: newOpcoes
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              const newOpcoes = [...(item.opcoes || []), ""];
              onItemChange({
                ...item,
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="checklist-items">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border rounded-md p-4"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-grow space-y-4">
                        <div className="flex items-start gap-2">
                          <div 
                            {...provided.dragHandleProps}
                            className="p-2 cursor-move flex items-center text-gray-500 hover:text-gray-700"
                          >
                            <MoveVertical className="h-5 w-5" />
                          </div>
                          <div className="flex-grow space-y-2">
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
                                  onValueChange={(value: any) => {
                                    // Reset options if changing from multiple choice
                                    const newItem = {
                                      ...item,
                                      tipo_resposta: value
                                    };
                                    if (value === "seleção múltipla" && !item.opcoes) {
                                      newItem.opcoes = ["Opção 1", "Opção 2"];
                                    }
                                    onItemChange(newItem);
                                  }}
                                >
                                  <SelectTrigger>
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
                            
                            {renderMultipleOptions(item)}
                            {renderMediaOptions(item)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        {showConfirmDelete === item.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelDelete}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete(item.id)}
                            >
                              Confirmar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
