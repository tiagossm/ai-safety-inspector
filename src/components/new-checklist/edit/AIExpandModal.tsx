
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AIExpandModalProps {
  onGenerateQuestions: (prompt: string, numQuestions: number) => Promise<void>;
  isGenerating: boolean;
  children: React.ReactNode;
}

export function AIExpandModal({ onGenerateQuestions, isGenerating, children }: AIExpandModalProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, descreva o que você quer adicionar ao checklist");
      return;
    }

    try {
      await onGenerateQuestions(prompt, numQuestions);
      setOpen(false);
      setPrompt("");
      toast.success("Perguntas geradas e adicionadas com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar perguntas:", error);
      toast.error("Erro ao gerar perguntas. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Expandir Checklist com IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">
              Descreva o que você quer adicionar ao checklist
            </Label>
            <Textarea
              id="ai-prompt"
              placeholder="Ex: Adicionar perguntas sobre segurança em espaços confinados, incluindo equipamentos de proteção individual, procedimentos de entrada e saída, e monitoramento de gases..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-questions">
              Número de perguntas a gerar
            </Label>
            <Input
              id="num-questions"
              type="number"
              min="1"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
              disabled={isGenerating}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Bot className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dica:</p>
                <p>Seja específico sobre o contexto e tipo de perguntas que deseja. A IA gerará perguntas relevantes que serão adicionadas ao final do seu checklist atual.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar Perguntas
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
