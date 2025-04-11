import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash, 
  GripVertical, 
  ArrowDown, 
  FileQuestion,
  AlertCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { QuestionOptions } from "./QuestionOptions";
import { QuestionMediaOptions } from "./QuestionMediaOptions";
import { QuestionType } from "@/types/newChecklist";
import { Badge } from "@/components/ui/badge";

interface ChecklistQuestionCardProps {
  question: any;
  index: number;
  onDelete: () => void;
  onChange: (field: string, value: any) => void;
  questions: any[];
  isDragging?: boolean;
  isNested?: boolean;
  parentQuestionLabel?: string;
  conditionValue?: string;
  dragHandleProps?: any;
}

export const ChecklistQuestionCard = ({
  question,
  index,
  onDelete,
  onChange,
  questions,
  isDragging,
  isNested,
  parentQuestionLabel,
  conditionValue,
  dragHandleProps
}: ChecklistQuestionCardProps) => {
  const handleTextChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(field, e.target.value);
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    onChange(field, checked);
  };

  const handleSelectChange = (field: string) => (value: any) => {
    onChange(field, value);
  };

  const responseTypeOptions = [
    { value: "sim/não", label: "Sim/Não" },
    { value: "múltipla escolha", label: "Múltipla Escolha" },
    { value: "texto", label: "Texto" },
    { value: "numérico", label: "Numérico" }
  ];

  // Find possible parent questions (exclude current and any children)
  const possibleParents = questions.filter(
    (q) => q.id !== question.id && !q.parentId
  );

  return (
    <Card 
      className={`mb-4 relative ${isDragging ? "opacity-50" : ""} ${
        isNested ? "border-l-4 border-l-blue-500 ml-6" : ""
      }`}
    >
      {parentQuestionLabel && (
        <div className="absolute -top-6 left-0">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <ArrowDown className="h-3 w-3" />
            <span className="text-xs">
              Subitem de: <span className="font-medium">{parentQuestionLabel}</span>
              {conditionValue && (
                <span className="ml-1">
                  {" "}
                  (quando <span className="font-medium">{conditionValue}</span>)
                </span>
              )}
            </span>
          </Badge>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <span className="font-medium text-sm">Pergunta {index + 1}</span>
          {question.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </div>
        <div className="flex gap-2">
          {question.hasSubChecklist && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileQuestion className="h-3 w-3" />
              <span className="text-xs">Sub-checklist</span>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${question.id}`}>
            Texto da pergunta
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={`question-text-${question.id}`}
            placeholder="Digite a pergunta aqui..."
            value={question.text}
            onChange={handleTextChange("text")}
            className="resize-none"
          />
          {!question.text && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>O texto da pergunta é obrigatório</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`question-type-${question.id}`}>Tipo de resposta</Label>
            <Select 
              value={question.responseType} 
              onValueChange={handleSelectChange("responseType")}
            >
              <SelectTrigger id={`question-type-${question.id}`}>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {responseTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`question-parent-${question.id}`}>Pergunta pai (opcional)</Label>
            <Select
              value={question.parentId || ""}
              onValueChange={handleSelectChange("parentId")}
            >
              <SelectTrigger id={`question-parent-${question.id}`}>
                <SelectValue placeholder="Selecione uma pergunta pai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (pergunta independente)</SelectItem>
                {possibleParents.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.text.length > 30 ? q.text.substring(0, 30) + "..." : q.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {question.parentId && (
          <div className="space-y-2">
            <Label htmlFor={`question-condition-${question.id}`}>
              Mostrar quando resposta for (opcional)
            </Label>
            <input
              id={`question-condition-${question.id}`}
              type="text"
              placeholder="Ex: 'Sim', '42', ou deixe em branco para sempre mostrar"
              value={question.conditionValue || ""}
              onChange={(e) => onChange("conditionValue", e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        )}

        {question.responseType === "múltipla escolha" && (
          <QuestionOptions
            options={question.options || []}
            onChange={(options) => onChange("options", options)}
          />
        )}

        <div className="pt-2 border-t">
          <Label className="mb-2 block">Opções avançadas</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={`question-required-${question.id}`} className="text-sm">
                  Resposta obrigatória
                </Label>
                <p className="text-xs text-muted-foreground">
                  A pergunta precisa ser respondida
                </p>
              </div>
              <Switch
                id={`question-required-${question.id}`}
                checked={question.isRequired}
                onCheckedChange={handleSwitchChange("isRequired")}
              />
            </div>
            
            <QuestionMediaOptions 
              question={question}
              onChange={onChange}
            />
            
            <div className="space-y-2">
              <Label htmlFor={`question-hint-${question.id}`}>Dica/Instrução</Label>
              <Textarea
                id={`question-hint-${question.id}`}
                placeholder="Adicione uma dica ou instrução para esta pergunta..."
                value={question.hint || ""}
                onChange={handleTextChange("hint")}
                className="resize-none text-sm h-20"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
