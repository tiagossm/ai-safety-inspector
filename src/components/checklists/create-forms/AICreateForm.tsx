
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NewChecklist } from "@/types/checklist";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAssistantType } from "@/hooks/new-checklist/useChecklistAI";
import { AIAssistantSelector } from "./AIAssistantSelector";

interface AICreateFormProps {
  form: NewChecklist;
  setForm: (form: NewChecklist) => void;
  users: any[];
  loadingUsers: boolean;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  onGenerateAI: () => void;
  aiLoading: boolean;
  companies: any[];
  loadingCompanies: boolean;
  selectedAssistant: AIAssistantType;
  setSelectedAssistant: (type: AIAssistantType) => void;
  openAIAssistant?: string;
  setOpenAIAssistant?: (id: string) => void;
  assistants?: any[];
  loadingAssistants?: boolean;
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
  aiLoading,
  companies,
  loadingCompanies,
  selectedAssistant,
  setSelectedAssistant,
  openAIAssistant,
  setOpenAIAssistant,
  assistants,
  loadingAssistants
}: AICreateFormProps) {
  const handleFormChange = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="Digite o título do checklist"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={form.category || ""}
              onChange={(e) => handleFormChange("category", e.target.value)}
              placeholder="Ex: Segurança, Qualidade, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select
              value={form.responsible_id || ""}
              onValueChange={(value) => handleFormChange("responsible_id", value || null)}
              disabled={loadingUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Carregando usuários..." : "Selecionar responsável"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum responsável</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email || <User className="h-4 w-4 mr-2" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select
              value={form.company_id || ""}
              onValueChange={(value) => handleFormChange("company_id", value || null)}
              disabled={loadingCompanies}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCompanies ? "Carregando empresas..." : "Selecionar empresa"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma empresa</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.fantasy_name || 'Empresa sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => handleFormChange("description", e.target.value)}
            placeholder="Digite uma descrição para o checklist"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_template"
            checked={form.is_template || false}
            onChange={(e) => handleFormChange("is_template", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="is_template">Este é um template</Label>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <AIAssistantSelector
            selectedAssistant={selectedAssistant}
            onChange={setSelectedAssistant}
            openAIAssistant={openAIAssistant}
            onOpenAIAssistantChange={setOpenAIAssistant}
          />
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">Descreva o checklist que deseja criar</Label>
              <Textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Crie um checklist para inspeção de segurança em canteiros de obras"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="numQuestions">Número de perguntas (aproximado)</Label>
                <span className="text-sm">{numQuestions}</span>
              </div>
              <Slider
                id="numQuestions"
                value={[numQuestions]}
                onValueChange={(value) => setNumQuestions(value[0])}
                min={5}
                max={50}
                step={1}
              />
            </div>
            
            <Button
              type="button"
              className="w-full mt-4"
              onClick={onGenerateAI}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando checklist...
                </>
              ) : (
                "Gerar checklist com IA"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
