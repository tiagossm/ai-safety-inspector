
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Trash2,
  GripHorizontal,
  Plus,
  Image,
  Video,
  Mic,
  FileText,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ToggleGroup,
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { SubChecklistButton } from "@/components/new-checklist/question-editor/SubChecklistButton";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  onUpdate?: (question: ChecklistQuestion) => void;
  onDelete?: (id: string) => void;
  isSubQuestion?: boolean;
  enableAllMedia?: boolean;
}

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  isSubQuestion = false,
  enableAllMedia = false
}: QuestionEditorProps) {
  const [showOptionsEditor, setShowOptionsEditor] = useState(false);
  const [newOption, setNewOption] = useState("");
  
  const handleUpdate = (field: keyof ChecklistQuestion, value: any) => {
    if (onUpdate) {
      onUpdate({
        ...question,
        [field]: value
      });
    }
  };
  
  const handleAddOption = () => {
    if (newOption.trim() && onUpdate) {
      const currentOptions = question.options || [];
      onUpdate({
        ...question,
        options: [...currentOptions, newOption.trim()]
      });
      setNewOption("");
    }
  };
  
  const handleRemoveOption = (index: number) => {
    if (onUpdate) {
      const currentOptions = [...(question.options || [])];
      currentOptions.splice(index, 1);
      onUpdate({
        ...question,
        options: currentOptions
      });
    }
  };
  
  // Parse hint if it contains JSON to extract only the user-facing hint
  const parseHint = (hint?: string | null): string => {
    if (!hint) return "";
    
    try {
      // Check if hint is JSON
      if (hint.startsWith("{") && hint.endsWith("}")) {
        const parsed = JSON.parse(hint);
        // If it's our group metadata format, return empty string
        if (parsed.groupId && parsed.groupTitle) {
          return "";
        }
      }
    } catch (e) {
      // Not JSON, just return the hint
    }
    
    return hint;
  };
  
  const userHint = parseHint(question.hint);
  
  return (
    <div className={`border rounded-md p-4 ${isSubQuestion ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="space-y-4">
        {/* Question text */}
        <div>
          <Textarea
            placeholder="Texto da pergunta"
            value={question.text}
            onChange={(e) => handleUpdate("text", e.target.value)}
            className="w-full"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Response type */}
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de resposta</label>
            <Select
              value={question.responseType}
              onValueChange={(value) => handleUpdate("responseType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes_no">Sim/Não</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                <SelectItem value="numeric">Numérico</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
                <SelectItem value="signature">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Weight/Points */}
          <div>
            <label className="text-sm font-medium mb-1 block">Peso/Pontos</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={question.weight}
              onChange={(e) => handleUpdate("weight", Number(e.target.value))}
            />
          </div>
          
          {/* Required switch */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Obrigatório</label>
            <Switch
              checked={question.isRequired}
              onCheckedChange={(checked) => handleUpdate("isRequired", checked)}
            />
          </div>
        </div>
        
        {/* Multiple choice options */}
        {question.responseType === "multiple_choice" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Opções de resposta</label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setShowOptionsEditor(!showOptionsEditor)}
              >
                {showOptionsEditor ? "Ocultar" : "Editar opções"}
              </Button>
            </div>
            
            {showOptionsEditor && (
              <div className="space-y-2 mt-2 border-t pt-2">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[index] = e.target.value;
                        handleUpdate("options", newOptions);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nova opção"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Hint text */}
        <div>
          <label className="text-sm font-medium mb-1 block">Dica para o inspetor</label>
          <Textarea
            placeholder="Instruções adicionais para o inspetor"
            value={userHint}
            onChange={(e) => handleUpdate("hint", e.target.value)}
            className="w-full"
            rows={2}
          />
        </div>
        
        {/* Media options */}
        <div>
          <label className="text-sm font-medium mb-1 block">Opções de mídia</label>
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem 
              value="photo" 
              aria-label="Permitir foto"
              data-state={question.allowsPhoto ? "on" : "off"}
              onClick={() => handleUpdate("allowsPhoto", !question.allowsPhoto)}
              title="Permitir foto"
            >
              <Image className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="video" 
              aria-label="Permitir vídeo"
              data-state={question.allowsVideo ? "on" : "off"}
              onClick={() => handleUpdate("allowsVideo", !question.allowsVideo)}
              title="Permitir vídeo"
            >
              <Video className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="audio" 
              aria-label="Permitir áudio"
              data-state={question.allowsAudio ? "on" : "off"}
              onClick={() => handleUpdate("allowsAudio", !question.allowsAudio)}
              title="Permitir áudio"
            >
              <Mic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="files" 
              aria-label="Permitir arquivos"
              data-state={question.allowsFiles ? "on" : "off"}
              onClick={() => handleUpdate("allowsFiles", !question.allowsFiles)}
              title="Permitir arquivos"
            >
              <FileText className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            {/* Only show Sub-checklist button for parent questions */}
            {!isSubQuestion && (
              <SubChecklistButton
                parentQuestionId={question.id}
                hasSubChecklist={question.hasSubChecklist || false}
                subChecklistId={question.subChecklistId}
                onSubChecklistCreated={(subChecklistId) => {
                  if (onUpdate) {
                    onUpdate({
                      ...question,
                      hasSubChecklist: true,
                      subChecklistId
                    });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
