
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NewChecklistPayload, AIAssistantType } from "@/types/newChecklist";
import { CompanyListItem } from "@/types/CompanyListItem";
import { Bot, Sparkles } from "lucide-react";
import { AIAssistantType as AIType } from "@/hooks/new-checklist/useChecklistAI";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IntelligentChecklistForm } from "./IntelligentChecklistForm";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklist } from "@/types/checklist";
import { useChecklistAI } from "@/hooks/new-checklist/useChecklistAI";

interface AIChecklistCreatorProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

export function AIChecklistCreator({
  form,
  setForm,
  onSubmit,
  isSubmitting,
  companies,
  loadingCompanies
}: AIChecklistCreatorProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");
  const {
    isGenerating,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    generateChecklist
  } = useChecklistAI();
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    if (form.company_id) {
      fetchCompanyName(form.company_id.toString());
    } else {
      setSelectedCompanyName("");
      updateFormattedPrompt(null, form.category || "", form.description || "");
    }
  }, [form.company_id, form.category, form.description]);

  const fetchCompanyName = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedCompanyName(data.fantasy_name);
      }
    } catch (error) {
      console.error("Error in fetchCompanyName:", error);
    }
  };

  const updateFormattedPrompt = (company: any | null, category: string, desc: string) => {
    // Update the prompt based on the selected company, category and description
    setPrompt(desc);
    
    // Also update the description in form
    setForm({
      ...form,
      description: desc
    });
  };

  const handleGenerateWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.category?.trim()) {
      toast.error("Por favor, informe a categoria do checklist");
      return;
    }

    if (!form.company_id) {
      toast.error("Por favor, selecione uma empresa");
      return;
    }

    if (!openAIAssistant) {
      toast.error("Por favor, selecione um assistente de IA");
      return;
    }

    try {
      // Create the payload for the checklist
      const checklistPayload: NewChecklistPayload = {
        title: form.title || form.category || "Novo Checklist",
        description: form.description || `Gerado por IA: ${prompt}`,
        category: form.category,
        is_template: form.is_template || false,
        company_id: form.company_id,
        status: form.status || "active"
      };
      
      const result = await generateChecklist(checklistPayload);
      
      if (result && result.success) {
        // Form submission is handled by the parent component
        await onSubmit(e);
      } else {
        toast.error("Erro ao gerar checklist com IA");
      }
    } catch (error) {
      console.error("Error generating checklist:", error);
      toast.error("Erro ao gerar checklist com IA");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerateWithAI}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria do Checklist <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  value={form.category || ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ex: NR-35, Inspeção de Equipamentos, Lista de Suprimentos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">
                  Empresa <span className="text-red-500">*</span>
                </Label>
                <CompanySelector
                  value={form.company_id?.toString() || ""}
                  onSelect={(companyId) => {
                    setForm({ 
                      ...form, 
                      company_id: companyId 
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <IntelligentChecklistForm
            selectedAssistant={selectedAssistant}
            onAssistantTypeChange={(type) => setSelectedAssistant(type as AIType)}
            openAIAssistant={openAIAssistant}
            onOpenAIAssistantChange={setOpenAIAssistant}
            onPromptChange={setPrompt}
            checklist={{
              ...form,
              company_name: selectedCompanyName
            }}
            setChecklist={setForm}
            numQuestions={questionCount}
            setNumQuestions={setQuestionCount}
          />
          
          <Button
            type="submit"
            disabled={isGenerating || isSubmitting || !form.category?.trim() || !form.company_id || !openAIAssistant}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 mt-4"
            size="lg"
          >
            {isGenerating || isSubmitting ? (
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
        </div>
      </form>
    </div>
  );
}
