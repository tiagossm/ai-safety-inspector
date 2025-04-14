
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion } from "@/types/newChecklist";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubitemGeneratorProps {
  questionId: string;
  questionText: string;
  onSubitemsGenerated: (subitems: ChecklistQuestion[], parentId: string) => void;
  onAddManualSubitem: () => void;
  maxSubitems: number;
  currentSubitemsCount: number;
}

export function SubitemGenerator({
  questionId,
  questionText,
  onSubitemsGenerated,
  onAddManualSubitem,
  maxSubitems = 5,
  currentSubitemsCount = 0
}: SubitemGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState("");
  const [subitemsCount, setSubitemsCount] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const remainingSubitems = maxSubitems - currentSubitemsCount;
  
  useEffect(() => {
    if (questionText && questionText.trim().length > 10) {
      const initialItemCount = Math.min(3, remainingSubitems);
      setSubitemsCount(initialItemCount);
      
      const defaultPrompt = `Elabore ${initialItemCount} subitens da pergunta: '${questionText}'`;
      setAutoPrompt(defaultPrompt);
      setPrompt(defaultPrompt);
    }
  }, [questionText, remainingSubitems]);

  const handleCountChange = (count: number) => {
    const validCount = Math.min(Math.max(1, count), remainingSubitems);
    setSubitemsCount(validCount);
    const newPrompt = `Elabore ${validCount} subitens da pergunta: '${questionText}'`;
    setPrompt(newPrompt);
  };
  
  const handleGenerateSubitems = async () => {
    if (remainingSubitems <= 0) {
      toast.error(`Limite máximo de ${maxSubitems} subitens atingido.`);
      return;
    }

    if (!prompt.trim()) {
      toast.error("Por favor, insira um prompt para gerar subitens.");
      return;
    }

    setIsGenerating(true);
    toast.info(`Gerando ${subitemsCount} subitens...`, { duration: 2000 });
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-sub-checklist", {
        body: {
          prompt: prompt,
          parentQuestionId: questionId,
          parentQuestionText: questionText,
          questionCount: Math.min(remainingSubitems, subitemsCount)
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success || !data?.subChecklist?.questions) {
        throw new Error("Falha ao gerar subitens. Tente novamente.");
      }

      const generatedQuestions: ChecklistQuestion[] = data.subChecklist.questions.map((q: any, index: number) => ({
        id: `new-${Date.now()}-${index}`,
        text: q.text,
        responseType: q.responseType || "yes_no",
        isRequired: q.isRequired !== false,
        options: Array.isArray(q.options) ? q.options.map(String) : [],
        weight: q.weight || 1,
        allowsPhoto: q.allowsPhoto || false,
        allowsVideo: q.allowsVideo || false,
        allowsAudio: q.allowsAudio || false,
        allowsFiles: q.allowsFiles || false,
        order: index,
        parentQuestionId: questionId,
        groupId: null
      }));

      onSubitemsGenerated(generatedQuestions, questionId);
      setIsDialogOpen(false);
      toast.success(`${generatedQuestions.length} subitens gerados com sucesso.`);
    } catch (err: any) {
      toast.error(`Erro ao gerar subitens: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={remainingSubitems <= 0}
          >
            <Sparkles className="h-4 w-4" />
            Gerar Subitens com IA
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerar Subitens com IA</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantidade de subitens (máx: {remainingSubitems})
              </label>
              <Input
                type="number"
                min={1}
                max={remainingSubitems}
                value={subitemsCount}
                onChange={(e) => handleCountChange(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prompt para geração
              </label>
              <Textarea
                placeholder="Descreva os subitens que deseja gerar"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              {autoPrompt && (
                <p className="text-xs text-muted-foreground">
                  Você pode editar o prompt acima ou usar a sugestão automática
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleGenerateSubitems}
              disabled={isGenerating || !prompt.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Subitens
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          onAddManualSubitem();
          toast.success("Subitem adicionado manualmente");
        }}
        disabled={remainingSubitems <= 0}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Adicionar Subitem Manualmente
      </Button>
      
      {remainingSubitems <= 0 && (
        <p className="text-xs text-amber-600">
          Limite máximo de {maxSubitems} subitens atingido.
        </p>
      )}
    </div>
  );
}
