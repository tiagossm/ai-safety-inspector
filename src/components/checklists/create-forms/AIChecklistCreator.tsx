
import React, { useState, useEffect } from "react";
import { NewChecklist } from "@/types/checklist";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { QuestionCountSelector } from "@/components/checklists/create-forms/QuestionCountSelector";
import { AIAssistantSelector } from "@/components/checklists/create-forms/AIAssistantSelector";
import { Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AIChecklistCreatorProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  companies: any[];
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
  const [aiPrompt, setAiPrompt] = useState("");
  const [openAIAssistant, setOpenAIAssistant] = useState("checklist");
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentThemes, setRecentThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState("");
  
  // Fetch recent themes from existing checklists
  useEffect(() => {
    const fetchRecentThemes = async () => {
      try {
        const { data, error } = await supabase
          .from('checklists')
          .select('category')
          .not('category', 'is', null)
          .order('created_at', { ascending: false })
          .limit(15);
          
        if (error) throw error;
        
        // Extract unique themes
        const themes = [...new Set(data
          .filter(item => item.category && item.category.trim() !== '')
          .map(item => item.category))];
          
        setRecentThemes(themes.slice(0, 5));
      } catch (err) {
        console.error("Error fetching themes:", err);
      }
    };
    
    fetchRecentThemes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiPrompt) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return;
    }
    
    if (!form.category) {
      toast.error("Por favor, selecione ou digite um tema para o checklist");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Update form with current theme field
      setForm(prev => ({
        ...prev,
        theme: form.category || customTheme,
        origin: 'ia'
      }));
      
      await onSubmit(e);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleThemeSelect = (theme: string) => {
    setForm({ ...form, category: theme });
    setCustomTheme("");
  };
  
  const handleCustomThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTheme(e.target.value);
    setForm({ ...form, category: e.target.value });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prompt para IA</Label>
              <Textarea
                placeholder="Descreva o checklist que você deseja criar..."
                rows={6}
                className="min-h-[120px]"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <CompanySelector
                  value={form.company_id?.toString() || ""}
                  onSelect={(companyId) => setForm({ ...form, company_id: companyId })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  placeholder="Digite um tema para o checklist"
                  value={customTheme || form.category || ""}
                  onChange={handleCustomThemeChange}
                  required
                />
                
                {recentThemes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recentThemes.map(theme => (
                      <Button
                        key={theme}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleThemeSelect(theme)}
                        className={`text-xs ${form.category === theme ? 'bg-blue-50 border-blue-300' : ''}`}
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AIAssistantSelector
                selectedAssistant={openAIAssistant}
                setSelectedAssistant={setOpenAIAssistant}
              />
              
              <QuestionCountSelector
                questionCount={numQuestions}
                setQuestionCount={setNumQuestions}
                min={5}
                max={30}
              />
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="isTemplate" 
                checked={form.is_template || false}
                onCheckedChange={(checked) => 
                  setForm({ ...form, is_template: checked as boolean })
                }
              />
              <Label htmlFor="isTemplate">Criar como template</Label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isGenerating || isSubmitting || !aiPrompt || !form.category}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Gerar Checklist
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
