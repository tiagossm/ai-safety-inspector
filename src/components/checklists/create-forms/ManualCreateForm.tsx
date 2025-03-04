
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewChecklist } from "@/types/checklist";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

// Response type options
const RESPONSE_TYPES = [
  { value: "texto", label: "Texto" },
  { value: "sim/não", label: "Sim/Não" },
  { value: "numérico", label: "Resposta Numérica" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "seleção múltipla", label: "Seleção Múltipla" }
];

interface ManualCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  canEdit?: boolean;
  questions: Array<{
    text: string;
    type: string;
    required: boolean;
  }>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, field: string, value: any) => void;
}

export function ManualCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  canEdit = true,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange
}: ManualCreateFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Informações Básicas</h3>
      
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título da lista de verificação"
            required
            disabled={!canEdit}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descreva o propósito desta lista de verificação..."
            rows={3}
            disabled={!canEdit}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select 
              value={form.responsible_id || ""} 
              onValueChange={(value) => setForm({ ...form, responsible_id: value })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="due-date">Data de vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={!canEdit}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.due_date ? (
                  format(new Date(form.due_date), "PPP", { locale: ptBR })
                ) : (
                  "Escolha uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.due_date ? new Date(form.due_date) : undefined}
                onSelect={(date) => 
                  setForm({ ...form, due_date: date ? date.toISOString() : null })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template"
            checked={form.is_template}
            onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
            disabled={!canEdit}
          />
          <Label htmlFor="template">
            Salvar como template
          </Label>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Questões</h3>
          <Button 
            type="button" 
            size="sm" 
            onClick={onAddQuestion}
            disabled={!canEdit}
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar pergunta
          </Button>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Adicione perguntas para a sua lista de verificação
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="border p-4 rounded-md">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Pergunta {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveQuestion(index)}
                    disabled={!canEdit || questions.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`question-${index}`}>Texto da pergunta</Label>
                    <Input
                      id={`question-${index}`}
                      value={question.text}
                      onChange={(e) => onQuestionChange(index, "text", e.target.value)}
                      placeholder="Insira a pergunta"
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`type-${index}`}>Tipo de resposta</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => onQuestionChange(index, "type", value)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger id={`type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESPONSE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 md:justify-end md:h-10">
                      <Switch
                        id={`required-${index}`}
                        checked={question.required}
                        onCheckedChange={(checked) => onQuestionChange(index, "required", checked)}
                        disabled={!canEdit}
                      />
                      <Label htmlFor={`required-${index}`}>Obrigatório</Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
