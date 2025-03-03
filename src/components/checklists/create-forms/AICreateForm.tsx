
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface AICreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  numQuestions: number;
  setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
  onGenerateAI: () => void;
  aiLoading: boolean;
}

export function AICreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  aiPrompt,
  setAiPrompt,
  numQuestions,
  setNumQuestions,
  onGenerateAI,
  aiLoading
}: AICreateFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="ai-prompt">Descreva o checklist que deseja criar</Label>
        <Textarea 
          id="ai-prompt" 
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ex: Gerar um checklist de inspeção de segurança para máquinas baseado na NR-12"
          rows={3}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="num-questions">Número de perguntas</Label>
        <Input 
          id="num-questions" 
          type="number" 
          min={5} 
          max={50} 
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="category-ai">Categoria</Label>
        <Select 
          value={form.category} 
          onValueChange={(value) => setForm({ ...form, category: value })}
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
        <Label htmlFor="responsible-ai">Responsável</Label>
        <Select 
          value={form.responsible_id || ""} 
          onValueChange={(value) => setForm({ ...form, responsible_id: value })}
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
      
      <Button 
        type="button"
        onClick={onGenerateAI}
        disabled={!aiPrompt || aiLoading}
        className="w-full"
      >
        {aiLoading ? "Gerando..." : "Gerar Checklist com IA"}
      </Button>
    </div>
  );
}
