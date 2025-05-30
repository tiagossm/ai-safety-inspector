
import { ChecklistItem } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText, Trash2, Video, Image, Mic, Info, Scale, Calendar, Settings, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  const handleOptionAdd = (item: ChecklistItem, option: string) => {
    const currentOptions = item.opcoes || [];
    onItemChange({
      ...item,
      opcoes: [...currentOptions, option]
    });
  };

  const handleOptionRemove = (item: ChecklistItem, optionIndex: number) => {
    const currentOptions = [...(item.opcoes || [])];
    currentOptions.splice(optionIndex, 1);
    onItemChange({
      ...item,
      opcoes: currentOptions
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card 
          key={item.id} 
          className={`overflow-hidden border ${item.obrigatorio ? 'border-l-4 border-l-primary' : ''}`}
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-grow p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{index + 1}.</span>
                  <h3 className="font-medium text-lg">{item.pergunta}</h3>
                  {item.obrigatorio && <Badge variant="outline" className="text-red-500">*</Badge>}
                </div>
                
                <Badge variant="outline" className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  <span>Peso: {item.weight || 1}</span>
                </Badge>
              </div>
              
              {item.hint && (
                <div className="flex items-start gap-2 mb-3 bg-muted/30 p-2 rounded-md">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">{item.hint}</p>
                </div>
              )}
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="py-2">
                    <span className="flex items-center text-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações da pergunta
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 py-2">
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
                        
                        <div className="grid gap-2">
                          <Label>Pergunta</Label>
                          <Input
                            value={item.pergunta}
                            onChange={(e) => onItemChange({
                              ...item,
                              pergunta: e.target.value
                            })}
                            placeholder="Digite a pergunta"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Dica/Instrução</Label>
                        <Textarea
                          value={item.hint || ""}
                          onChange={(e) => onItemChange({
                            ...item,
                            hint: e.target.value
                          })}
                          placeholder="Instruções para o inspetor (opcional)"
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                      
                      {item.tipo_resposta === "seleção múltipla" && (
                        <div className="space-y-2">
                          <Label>Opções de Resposta</Label>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(item.opcoes || []).map((option, i) => (
                              <Badge 
                                key={i} 
                                variant="secondary"
                                className="flex items-center gap-1 px-2 py-1"
                              >
                                {option}
                                <button 
                                  onClick={() => handleOptionRemove(item, i)}
                                  className="ml-1 text-xs opacity-70 hover:opacity-100"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nova opção..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.currentTarget;
                                  if (input.value.trim()) {
                                    handleOptionAdd(item, input.value);
                                    input.value = '';
                                  }
                                  e.preventDefault();
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                const input = e.currentTarget.previousSibling as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleOptionAdd(item, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`required-${item.id}`}>Obrigatório</Label>
                            <Switch
                              id={`required-${item.id}`}
                              checked={item.obrigatorio}
                              onCheckedChange={(checked) => onItemChange({
                                ...item,
                                obrigatorio: checked
                              })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`permite-foto-${item.id}`}>
                              <div className="flex items-center">
                                <Image className="h-4 w-4 mr-1" />
                                Permitir Foto
                              </div>
                            </Label>
                            <Switch
                              id={`permite-foto-${item.id}`}
                              checked={item.permite_foto}
                              onCheckedChange={(checked) => onItemChange({
                                ...item,
                                permite_foto: checked
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`permite-video-${item.id}`}>
                              <div className="flex items-center">
                                <Video className="h-4 w-4 mr-1" />
                                Permitir Vídeo
                              </div>
                            </Label>
                            <Switch
                              id={`permite-video-${item.id}`}
                              checked={item.permite_video}
                              onCheckedChange={(checked) => onItemChange({
                                ...item,
                                permite_video: checked
                              })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`permite-audio-${item.id}`}>
                              <div className="flex items-center">
                                <Mic className="h-4 w-4 mr-1" />
                                Permitir Áudio
                              </div>
                            </Label>
                            <Switch
                              id={`permite-audio-${item.id}`}
                              checked={item.permite_audio}
                              onCheckedChange={(checked) => onItemChange({
                                ...item,
                                permite_audio: checked
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className="flex md:flex-col justify-end border-t md:border-t-0 md:border-l">
              <Button
                variant="ghost"
                size="icon"
                className="flex-1 md:flex-none rounded-none text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
