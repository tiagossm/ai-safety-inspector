
import React, { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";
import { OptionWithId, createOptionWithId, convertStringArrayToOptions, convertOptionsToStringArray } from "@/utils/optionHelpers";

interface UnifiedOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  questionId: string;
  responseType: string;
}

export function UnifiedOptionsEditor({
  options,
  onOptionsChange,
  questionId,
  responseType
}: UnifiedOptionsEditorProps) {
  const [newOption, setNewOption] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Verificar se o tipo de resposta requer opções
  const requiresOptions = TYPES_REQUIRING_OPTIONS.includes(responseType as any);
  
  // Converter string[] para OptionWithId[] mantendo IDs estáveis
  const [optionsWithIds, setOptionsWithIds] = useState<OptionWithId[]>(() => {
    return convertStringArrayToOptions(options);
  });

  // Sincronizar quando options prop mudar
  React.useEffect(() => {
    const currentOptionsAsStrings = convertOptionsToStringArray(optionsWithIds);
    if (JSON.stringify(currentOptionsAsStrings) !== JSON.stringify(options)) {
      setOptionsWithIds(convertStringArrayToOptions(options));
    }
  }, [options, optionsWithIds]);

  // Validação de opções
  const validation = useMemo(() => {
    const hasValidOptions = optionsWithIds.length > 0 && optionsWithIds.some(opt => opt.label.trim());
    const hasEmptyOptions = optionsWithIds.some(opt => !opt.label.trim());
    const hasDuplicates = new Set(optionsWithIds.map(opt => opt.label.toLowerCase().trim())).size !== optionsWithIds.length;
    
    return {
      isValid: requiresOptions ? hasValidOptions && !hasEmptyOptions && !hasDuplicates : true,
      hasValidOptions,
      hasEmptyOptions,
      hasDuplicates,
      isEmpty: optionsWithIds.length === 0
    };
  }, [optionsWithIds, requiresOptions]);

  const updateParent = useCallback((newOptionsWithIds: OptionWithId[]) => {
    setOptionsWithIds(newOptionsWithIds);
    onOptionsChange(convertOptionsToStringArray(newOptionsWithIds));
  }, [onOptionsChange]);

  const addOption = useCallback(() => {
    if (!newOption.trim()) {
      toast.error("Digite uma opção válida");
      return;
    }
    
    // Verificar duplicatas
    const isDuplicate = optionsWithIds.some(
      opt => opt.label.toLowerCase().trim() === newOption.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      toast.error("Esta opção já existe");
      return;
    }

    const newOptionsWithIds = [...optionsWithIds, createOptionWithId(newOption.trim())];
    updateParent(newOptionsWithIds);
    setNewOption("");
    toast.success("Opção adicionada");
  }, [newOption, optionsWithIds, updateParent]);

  const updateOption = useCallback((id: string, newLabel: string) => {
    const newOptionsWithIds = optionsWithIds.map(option =>
      option.id === id ? { ...option, label: newLabel } : option
    );
    updateParent(newOptionsWithIds);
  }, [optionsWithIds, updateParent]);

  const removeOption = useCallback((id: string) => {
    const newOptionsWithIds = optionsWithIds.filter(option => option.id !== id);
    updateParent(newOptionsWithIds);
    toast.success("Opção removida");
  }, [optionsWithIds, updateParent]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(optionsWithIds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateParent(items);
  }, [optionsWithIds, updateParent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  }, [addOption]);

  // Se o tipo não requer opções, não renderizar nada
  if (!requiresOptions) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Opções de Resposta
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
          </CardTitle>
          <Badge variant={validation.isValid ? "secondary" : "destructive"}>
            {optionsWithIds.length} opção{optionsWithIds.length !== 1 ? 'ões' : ''}
          </Badge>
        </div>
        
        {/* Indicadores de validação */}
        {!validation.isValid && (
          <div className="space-y-1">
            {validation.isEmpty && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Adicione pelo menos uma opção
              </p>
            )}
            {validation.hasEmptyOptions && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Algumas opções estão vazias
              </p>
            )}
            {validation.hasDuplicates && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Há opções duplicadas
              </p>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lista de opções existentes */}
        {optionsWithIds.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`options-${questionId}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-2 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-md p-2' : ''
                  }`}
                >
                  {optionsWithIds.map((option, index) => (
                    <Draggable key={option.id} draggableId={option.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 group p-2 rounded-md border transition-all ${
                            snapshot.isDragging 
                              ? 'bg-white shadow-lg border-blue-300' 
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          } ${
                            !option.label.trim() ? 'border-amber-300 bg-amber-50' : ''
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-center w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <Badge variant="outline" className="min-w-[2rem] text-center">
                            {index + 1}
                          </Badge>
                          
                          <Input
                            value={option.label}
                            onChange={(e) => updateOption(option.id, e.target.value)}
                            placeholder={`Opção ${index + 1}`}
                            className={`flex-1 border-0 bg-transparent focus:bg-white ${
                              !option.label.trim() ? 'border-amber-300' : ''
                            }`}
                          />
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Adição de nova opção */}
        <div className="flex gap-2 p-3 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <Input
            placeholder="Digite uma nova opção..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white"
          />
          <Button
            type="button"
            onClick={addOption}
            disabled={!newOption.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {/* Dicas de uso */}
        {optionsWithIds.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">Nenhuma opção adicionada ainda</p>
            <p className="text-xs">Este tipo de pergunta requer pelo menos uma opção</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
