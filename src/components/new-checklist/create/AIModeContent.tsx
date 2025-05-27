import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles, RefreshCw } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/typeConsistency";
import { useOpenAIAssistants } from "@/hooks/new-checklist/useOpenAIAssistants"; // <-- Adicionado aqui

interface AIModeContentProps {
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  aiLoading: boolean;
  setAiLoading: (value: boolean) => void;
  selectedAssistant: string;
  setSelectedAssistant: (value: string) => void;
  numQuestions: number;
  setNumQuestions: (value: number) => void;
  contextType: string;
  setContextType: (value: string) => void;
  contextValue: string;
  setContextValue: (value: string) => void;
  companyId: string;
  category: string;
  description: string;
  questions: ChecklistQuestion[];
  setQuestions: (questions: ChecklistQuestion[]) => void;
}

export function AIModeContent({
  aiPrompt,
  setAiPrompt,
  aiLoading,
  setAiLoading,
  selectedAssistant,
  setSelectedAssistant,
  numQuestions,
  setNumQuestions,
  contextType,
  setContextType,
  contextValue,
  setContextValue,
  companyId,
  category,
  description,
  questions,
  setQuestions
}: AIModeContentProps) {
  const [companyData, setCompanyData] = useState<any>(null);
  const [formattedPrompt, setFormattedPrompt] = useState<string>("");

  // Importa assistants dinamicamente do hook
  const { assistants, loading: assistantsLoading, error: assistantsError } = useOpenAIAssistants();

  // Buscar dados da empresa quando companyId mudar
  useEffect(() => {
    if (companyId) {
      fetchCompanyData(companyId);
    } else {
      setCompanyData(null);
      updateFormattedPrompt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, category, description, contextType, contextValue]);

  const fetchCompanyData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setCompanyData(data);
      updateFormattedPrompt(data);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Erro ao carregar dados da empresa");
    }
  };

  const updateFormattedPrompt = (company: any) => {
    const metadata = company?.metadata || null;
    const riskGrade = metadata?.risk_grade || "não informado";
    const employeeCount = company?.employee_count || "não informado";
    const context = contextType && contextValue ? `${contextType}: ${contextValue}` : "";

    const prompt = `Categoria: ${category || "Não especificada"}
Empresa: ${company?.fantasy_name || 'Empresa'} (CNPJ ${company?.cnpj || 'não informado'}, CNAE ${company?.cnae || 'não informado'}, Grau de Risco ${riskGrade}, Funcionários: ${employeeCount})
Descrição: ${description}
Contexto: ${context}

Gere ${numQuestions} perguntas específicas para este checklist.`;

    setFormattedPrompt(prompt);
    setAiPrompt(prompt);
  };

  const handleGenerateAI = async () => {
    if (!category.trim() || !companyId || !description.trim()) {
      toast.error("Preencha todos os campos obrigatórios antes de gerar");
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt: formattedPrompt,
          checklistData: {
            title: `Checklist: ${category}`,
            description: description,
            category: category,
            company_id: companyId,
            assistant_id: selectedAssistant // Agora envia o ID do assistant selecionado!
          },
          questionCount: numQuestions
        }
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        const aiQuestions: ChecklistQuestion[] = data.questions.map((q: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          text: q.text,
          responseType: normalizeResponseType(q.responseType || "sim/não"),
          isRequired: q.isRequired !== false,
          order: questions.length + index,
          weight: q.weight || 1,
          allowsPhoto: q.allowsPhoto || false,
          allowsVideo: q.allowsVideo || false,
          allowsAudio: q.allowsAudio || false,
          allowsFiles: q.allowsFiles || false,
          options: q.options || undefined,
          hint: q.hint || ""
        }));

        setQuestions([...questions, ...aiQuestions]);
        toast.success(`${aiQuestions.length} perguntas geradas pela IA`);
      }
    } catch (error) {
      console.error("Erro na geração por IA:", error);
      toast.error("Erro ao gerar checklist com IA");
    } finally {
      setAiLoading(false);
    }
  };

  const canGenerate = category.trim() && companyId && description.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assistant">Assistente de IA</Label>
              <Select 
                value={selectedAssistant} 
                onValueChange={setSelectedAssistant}
                disabled={assistantsLoading || !!assistantsError}
              >
                <SelectTrigger id="assistant">
                  <SelectValue placeholder={
                    assistantsLoading 
                      ? "Carregando assistentes..." 
                      : (assistantsError 
                        ? "Erro ao carregar assistentes" 
                        : "Selecione um assistente da OpenAI")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {assistantsLoading ? (
                    <SelectItem value="" disabled>Carregando assistentes...</SelectItem>
                  ) : assistantsError ? (
                    <SelectItem value="" disabled>Erro ao carregar assistentes</SelectItem>
                  ) : (
                    assistants.length === 0 ? (
                      <SelectItem value="" disabled>Nenhum assistente disponível</SelectItem>
                    ) : (
                      assistants.map((assistant) => (
                        <SelectItem key={assistant.id} value={assistant.id}>
                          {assistant.name}
                          {assistant.model ? (
                            <span style={{fontSize: '0.8em', color: '#888', marginLeft: 8}}>
                              ({assistant.model})
                            </span>
                          ) : null}
                        </SelectItem>
                      ))
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numQuestions">Número de perguntas</Label>
              <Input
                id="numQuestions"
                type="number"
                min="5"
                max="50"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contextType">Tipo de contexto</Label>
              <Select value={contextType} onValueChange={setContextType}>
                <SelectTrigger id="contextType">
                  <SelectValue placeholder="Escolha o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Setor">Setor</SelectItem>
                  <SelectItem value="Cargo">Cargo</SelectItem>
                  <SelectItem value="Atividade">Atividade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contextValue">Valor</Label>
              <Input
                id="contextValue"
                value={contextValue}
                onChange={(e) => setContextValue(e.target.value)}
                placeholder="Ex: Almoxarifado"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Prompt Final
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFormattedPrompt(companyData)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formattedPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="O prompt será gerado automaticamente com base nos campos preenchidos"
          />
          
          <Button
            onClick={handleGenerateAI}
            disabled={aiLoading || !canGenerate}
            className="w-full mt-4"
            size="lg"
          >
            {aiLoading ? (
              <>
                <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Bot className="h-5 w-5 mr-2" />
                Gerar Perguntas com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
