
import React, { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles } from "lucide-react";
import { useChecklistAI } from "@/hooks/new-checklist/useChecklistAI";
import { CompanyListItem } from "@/types/CompanyListItem";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { FormActions } from "./FormActions";
import { useNavigate } from "react-router-dom";

interface AIChecklistCreatorProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  isSubmitting: boolean;
}

type AssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality';

export function AIChecklistCreator({
  form,
  setForm,
  companies,
  loadingCompanies,
  onSubmit,
  isSubmitting
}: AIChecklistCreatorProps) {
  const navigate = useNavigate();
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType>("general");
  const { 
    isGenerating, 
    setPrompt, 
    setOpenAIAssistant, 
    setSelectedAssistant: setChecklistAssistant,
    setQuestionCount
  } = useChecklistAI();

  const handleGenerateAI = (e: React.FormEvent) => {
    if (!aiPrompt.trim()) {
      return;
    }
    
    // Set values in the useChecklistAI hook
    setPrompt(aiPrompt);
    setChecklistAssistant(selectedAssistant);
    setQuestionCount(numQuestions);
    
    // Define um título baseado no prompt se não estiver definido
    if (!form.title) {
      const shortPrompt = aiPrompt.length > 40 ? 
        aiPrompt.substring(0, 40) + "..." : 
        aiPrompt;
      setForm({
        ...form,
        title: `Checklist: ${shortPrompt}`,
        description: `Checklist gerado com base em: ${aiPrompt}`,
        status: "active",
        status_checklist: "ativo"
      });
    }
    
    onSubmit(e);
  };

  return (
    <form onSubmit={handleGenerateAI} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-lg font-medium">Prompt para gerar o checklist *</Label>
            <Textarea
              id="prompt"
              placeholder="Descreva o checklist que você deseja gerar. Ex: Checklist para inspeção de segurança em um canteiro de obras..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={6}
              className="w-full text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-questions" className="text-base">Número de perguntas</Label>
            <Input
              id="num-questions"
              type="number"
              min="5"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-medium">Selecione o tipo de assistente</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`p-4 cursor-pointer transition-all ${selectedAssistant === 'general' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
                onClick={() => setSelectedAssistant('general')}
              >
                <div className="flex flex-col items-center text-center gap-2 p-2">
                  <input
                    type="radio"
                    checked={selectedAssistant === 'general'}
                    onChange={() => setSelectedAssistant('general')}
                    className="sr-only"
                    id="assistant-general"
                  />
                  <div className={`w-5 h-5 rounded-full border ${selectedAssistant === 'general' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                    {selectedAssistant === 'general' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
                  </div>
                  <label htmlFor="assistant-general" className="font-medium">Geral</label>
                  <p className="text-xs text-muted-foreground">
                    Checklists para uso geral e diversos propósitos
                  </p>
                </div>
              </Card>
              
              <Card 
                className={`p-4 cursor-pointer transition-all ${selectedAssistant === 'workplace-safety' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
                onClick={() => setSelectedAssistant('workplace-safety')}
              >
                <div className="flex flex-col items-center text-center gap-2 p-2">
                  <input
                    type="radio"
                    checked={selectedAssistant === 'workplace-safety'}
                    onChange={() => setSelectedAssistant('workplace-safety')}
                    className="sr-only"
                    id="assistant-safety"
                  />
                  <div className={`w-5 h-5 rounded-full border ${selectedAssistant === 'workplace-safety' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                    {selectedAssistant === 'workplace-safety' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
                  </div>
                  <label htmlFor="assistant-safety" className="font-medium">Segurança</label>
                  <p className="text-xs text-muted-foreground">
                    Segurança do trabalho, prevenção de acidentes
                  </p>
                </div>
              </Card>
              
              <Card 
                className={`p-4 cursor-pointer transition-all ${selectedAssistant === 'compliance' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
                onClick={() => setSelectedAssistant('compliance')}
              >
                <div className="flex flex-col items-center text-center gap-2 p-2">
                  <input
                    type="radio"
                    checked={selectedAssistant === 'compliance'}
                    onChange={() => setSelectedAssistant('compliance')}
                    className="sr-only"
                    id="assistant-compliance"
                  />
                  <div className={`w-5 h-5 rounded-full border ${selectedAssistant === 'compliance' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                    {selectedAssistant === 'compliance' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
                  </div>
                  <label htmlFor="assistant-compliance" className="font-medium">Conformidade</label>
                  <p className="text-xs text-muted-foreground">
                    Auditorias, normas e requisitos regulatórios
                  </p>
                </div>
              </Card>
              
              <Card 
                className={`p-4 cursor-pointer transition-all ${selectedAssistant === 'quality' ? 'border-teal-500 ring-1 ring-teal-500' : 'hover:border-muted-foreground'}`}
                onClick={() => setSelectedAssistant('quality')}
              >
                <div className="flex flex-col items-center text-center gap-2 p-2">
                  <input
                    type="radio"
                    checked={selectedAssistant === 'quality'}
                    onChange={() => setSelectedAssistant('quality')}
                    className="sr-only"
                    id="assistant-quality"
                  />
                  <div className={`w-5 h-5 rounded-full border ${selectedAssistant === 'quality' ? 'bg-teal-500 border-teal-600' : 'border-gray-400'}`}>
                    {selectedAssistant === 'quality' && <div className="w-2.5 h-2.5 rounded-full bg-white mx-auto mt-1"></div>}
                  </div>
                  <label htmlFor="assistant-quality" className="font-medium">Qualidade</label>
                  <p className="text-xs text-muted-foreground">
                    Controle de qualidade e processos
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="company_id">Empresa (opcional)</Label>
            <CompanySelector
              value={form.company_id?.toString() || ""}
              onSelect={(companyId) => {
                setForm({ 
                  ...form, 
                  company_id: companyId 
                });
              }}
            />
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa para gerar um checklist específico para ela.
            </p>
          </div>
        </div>
        
        <div>
          <Card className="bg-slate-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Como funciona</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Nosso assistente de IA irá gerar um checklist com base na sua descrição. 
              Quanto mais detalhado for o prompt, melhores serão os resultados.
            </p>
            
            <h4 className="font-medium text-sm mt-4 mb-2">Exemplos de prompts:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>"Checklist para inspeção de segurança em andaimes"</li>
              <li>"Lista de verificação para manutenção preventiva de empilhadeiras"</li>
              <li>"Auditoria de conformidade para normas de proteção contra incêndio"</li>
            </ul>
            
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Você poderá revisar e editar o checklist gerado antes de salvá-lo.
              </p>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || isGenerating || !aiPrompt.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
          size="lg"
        >
          {isSubmitting || isGenerating ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-5 w-5" />
              Gerar Checklist com IA
            </>
          )}
        </Button>
        
        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/checklists")}
          canSubmit={false}
          submitText=""
          showSubmitButton={false}
        />
      </div>
    </form>
  );
}
