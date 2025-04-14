
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Image,
  Video,
  Mic,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Grid3X3,
} from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { SubitemGenerator } from "./SubitemGenerator";

interface QuestionItemProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  enableAllMedia?: boolean;
  parentId?: string;
}

export function QuestionItem({
  question,
  onUpdate,
  onDelete,
  enableAllMedia = false,
  parentId
}: QuestionItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubitemsOpen, setIsSubitemsOpen] = useState(false);
  const [subitems, setSubitems] = useState<ChecklistQuestion[]>([]);
  const MAX_SUBITEMS = 5;

  // Effect to enable all media options if the enableAllMedia prop is true
  React.useEffect(() => {
    if (enableAllMedia && (!question.allowsPhoto || !question.allowsVideo || !question.allowsAudio || !question.allowsFiles)) {
      onUpdate({
        ...question,
        allowsPhoto: true,
        allowsVideo: true,
        allowsAudio: true,
        allowsFiles: true
      });
    }
  }, [enableAllMedia, question, onUpdate]);

  // Handler to update a question field
  const handleChange = (field: keyof ChecklistQuestion, value: any) => {
    // For options field, ensure it's always a string array
    if (field === 'options') {
      const options = Array.isArray(value) ? value.map(String) : [];
      onUpdate({ ...question, [field]: options });
      return;
    }
    
    onUpdate({ ...question, [field]: value });
  };

  const handleSubitemAdded = () => {
    const newSubitems = [...(subitems || [])];
    
    if (newSubitems.length >= MAX_SUBITEMS) {
      toast.error(`Limite máximo de ${MAX_SUBITEMS} subitens atingido.`);
      return;
    }

    const newSubitem: ChecklistQuestion = {
      id: `new-${Date.now()}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: newSubitems.length,
      parentQuestionId: question.id,
      options: [],
      groupId: question.groupId
    };
    
    newSubitems.push(newSubitem);
    setSubitems(newSubitems);
    onUpdate({
      ...question,
      hasSubChecklist: true
    });
    
    if (!isSubitemsOpen) {
      setIsSubitemsOpen(true);
    }
  };

  const handleSubitemUpdate = (updatedSubitem: ChecklistQuestion) => {
    setSubitems((prev) => 
      prev.map(item => item.id === updatedSubitem.id ? updatedSubitem : item)
    );
  };

  const handleSubitemDelete = (subitemId: string) => {
    setSubitems((prev) => prev.filter(item => item.id !== subitemId));
    
    // If no more subitems, update the parent question
    if (subitems.length <= 1) {
      onUpdate({
        ...question,
        hasSubChecklist: false
      });
    }
  };

  const handleSubitemsGenerated = (generatedSubitems: ChecklistQuestion[], parentId: string) => {
    const currentCount = subitems.length;
    const availableSlots = MAX_SUBITEMS - currentCount;
    
    if (availableSlots <= 0) {
      toast.error(`Limite máximo de ${MAX_SUBITEMS} subitens atingido.`);
      return;
    }
    
    // Take only as many subitems as there are available slots
    const subitemsToAdd = generatedSubitems.slice(0, availableSlots);
    
    setSubitems([...subitems, ...subitemsToAdd]);
    setIsSubitemsOpen(true);
    
    onUpdate({
      ...question,
      hasSubChecklist: true
    });
  };

  const responseTypeOptions = [
    { value: "yes_no", label: "Sim/Não" },
    { value: "text", label: "Texto" },
    { value: "multiple_choice", label: "Múltipla Escolha" },
    { value: "numeric", label: "Numérico" },
    { value: "photo", label: "Foto" },
    { value: "signature", label: "Assinatura" }
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="px-4 py-3 bg-gray-50">
        <div className="flex justify-between items-start">
          <CollapsibleTrigger 
            onClick={() => setIsOpen(!isOpen)} 
            className="flex items-center gap-2 hover:text-primary cursor-pointer text-sm font-medium"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {question.parentQuestionId ? "Subitem" : "Pergunta"}
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(question.id)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`question-text-${question.id}`}>Enunciado</Label>
              <Textarea
                id={`question-text-${question.id}`}
                value={question.text}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="Digite a pergunta..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`response-type-${question.id}`}>Tipo de resposta</Label>
                <Select
                  value={question.responseType}
                  onValueChange={(value) => handleChange("responseType", value)}
                >
                  <SelectTrigger id={`response-type-${question.id}`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {responseTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`weight-${question.id}`}>Peso / Pontos</Label>
                <Input
                  id={`weight-${question.id}`}
                  type="number"
                  min={1}
                  max={10}
                  value={question.weight}
                  onChange={(e) => handleChange("weight", Number(e.target.value))}
                />
              </div>
            </div>

            {question.responseType === "multiple_choice" && (
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="space-y-2">
                  {(question.options || []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={String(option)}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[index] = e.target.value;
                          handleChange("options", newOptions);
                        }}
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(index, 1);
                          handleChange("options", newOptions);
                        }}
                        className="h-10 w-10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [...(question.options || []), ""];
                      handleChange("options", newOptions);
                    }}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Opção
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`hint-${question.id}`}>Dica para o inspetor</Label>
              <Textarea
                id={`hint-${question.id}`}
                value={question.hint || ""}
                onChange={(e) => handleChange("hint", e.target.value)}
                placeholder="Digite uma dica..."
                className="min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.isRequired}
                    onCheckedChange={(checked) => handleChange("isRequired", checked)}
                  />
                  <Label htmlFor={`required-${question.id}`}>Obrigatório</Label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm">Permitir mídia:</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={question.allowsPhoto ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    title="Permitir fotos"
                    onClick={() => handleChange("allowsPhoto", !question.allowsPhoto)}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={question.allowsVideo ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    title="Permitir vídeos"
                    onClick={() => handleChange("allowsVideo", !question.allowsVideo)}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={question.allowsAudio ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    title="Permitir áudios"
                    onClick={() => handleChange("allowsAudio", !question.allowsAudio)}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={question.allowsFiles ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    title="Permitir arquivos"
                    onClick={() => handleChange("allowsFiles", !question.allowsFiles)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {!question.parentQuestionId && (
        <CardFooter className="px-4 py-2 bg-gray-50 flex justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubitemsOpen(!isSubitemsOpen)}
              className="flex items-center gap-1"
            >
              <Grid3X3 className="h-4 w-4" />
              Subitens {subitems.length > 0 ? `(${subitems.length})` : ""}
              {isSubitemsOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSubitemAdded}
              disabled={subitems.length >= MAX_SUBITEMS}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Adicionar Subitem
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Subitems collapsible section */}
      {!question.parentQuestionId && (
        <Collapsible open={isSubitemsOpen}>
          <CollapsibleContent className="py-2 border-t">
            <div className="px-4">
              <SubitemGenerator
                questionId={question.id}
                questionText={question.text}
                onSubitemsGenerated={handleSubitemsGenerated}
                maxSubitems={MAX_SUBITEMS}
                currentSubitemsCount={subitems.length}
              />
              
              <div className="pl-4 space-y-3">
                {subitems.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum subitem criado. Adicione manualmente ou gere com IA.
                  </div>
                ) : (
                  subitems.map((subitem) => (
                    <QuestionItem
                      key={subitem.id}
                      question={subitem}
                      onUpdate={handleSubitemUpdate}
                      onDelete={handleSubitemDelete}
                      enableAllMedia={enableAllMedia}
                      parentId={question.id}
                    />
                  ))
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}
