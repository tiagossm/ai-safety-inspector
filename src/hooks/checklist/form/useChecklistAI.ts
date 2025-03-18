
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  const generateAIChecklist = async (form: NewChecklist) => {
    try {
      setAiLoading(true);
      
      // Refresh the session to ensure we have a valid token
      await refreshSession();
      
      // Get current session with refreshed token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Você precisa estar autenticado para gerar um checklist com IA");
        setAiLoading(false);
        return false;
      }
      
      if (!sessionData.session) {
        console.error("No active session");
        toast.error("Sessão inválida. Faça login novamente.");
        setAiLoading(false);
        return false;
      }
      
      console.log("Preparing AI request: ", {
        prompt: aiPrompt,
        num_questions: numQuestions,
        category: form.category || 'general',
        user_id: typedUser?.id,
        company_id: form.company_id
      });
      
      // Ensure user_id is set
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
      }
      
      // Prepare the checklist data
      const checklistData = {
        title: form.title || `Checklist de ${form.category || 'Segurança'}: ${aiPrompt.substring(0, 50)}${aiPrompt.length > 50 ? '...' : ''}`,
        description: `Checklist gerado automaticamente com base em: ${aiPrompt}`,
        is_template: form.is_template || false,
        status_checklist: "ativo",
        category: form.category || 'general',
        user_id: form.user_id,
        company_id: form.company_id === "none" ? null : form.company_id,
        due_date: form.due_date,
        responsible_id: form.responsible_id === "none" ? null : form.responsible_id
      };
      
      // Generate questions based on the prompt and category
      const questionTypes = ["sim/não", "texto", "numérico", "sim/não", "múltipla escolha"];
      const questions = [];
      
      // Generate sample questions based on checklist category
      const baseQuestions = {
        safety: [
          "Os equipamentos de proteção individual (EPI) estão sendo utilizados corretamente?",
          "Existem extintores de incêndio em todos os locais necessários?",
          "As rotas de evacuação estão devidamente sinalizadas?",
          "Os funcionários receberam treinamento adequado para emergências?"
        ],
        quality: [
          "Os produtos atendem às especificações técnicas?",
          "Existe um sistema de controle de qualidade implementado?",
          "Os instrumentos de medição estão calibrados?",
          "São realizadas inspeções periódicas nos produtos finais?"
        ],
        maintenance: [
          "Os equipamentos receberam manutenção preventiva conforme cronograma?",
          "Há registro de manutenções corretivas recentes?",
          "As peças de reposição estão disponíveis em estoque?",
          "Os manuais técnicos estão acessíveis aos técnicos?"
        ],
        environment: [
          "Os resíduos são separados corretamente?",
          "Existe um sistema de tratamento de efluentes?",
          "As licenças ambientais estão em dia?",
          "Há medidas para redução de consumo de água?"
        ],
        operational: [
          "Os procedimentos operacionais padrão (POPs) estão disponíveis?",
          "Os funcionários seguem as instruções de trabalho?",
          "A produtividade está dentro das metas estabelecidas?",
          "Há registros de paradas não programadas?"
        ],
        general: [
          "A documentação está atualizada e organizada?",
          "O ambiente de trabalho está limpo e organizado?",
          "Os colaboradores possuem as ferramentas necessárias?",
          "Os processos estão documentados e acessíveis?"
        ]
      };
      
      // Use the base questions for the selected category (or default to general)
      const category = form.category as keyof typeof baseQuestions || 'general';
      const categoryQuestions = baseQuestions[category] || baseQuestions.general;
      
      // Add the base questions
      for (let i = 0; i < Math.min(categoryQuestions.length, numQuestions); i++) {
        questions.push({
          text: categoryQuestions[i],
          type: "sim/não",
          required: true,
          allowAudio: true,
          allowVideo: true,
          allowPhoto: true
        });
      }
      
      // Generate additional questions if needed
      const keywords = aiPrompt.toLowerCase().split(' ');
      for (let i = categoryQuestions.length; i < numQuestions; i++) {
        const questionType = questionTypes[i % questionTypes.length];
        const keyword = keywords[i % keywords.length] || 'segurança';
        
        let text = `Verificar condições de ${keyword}`;
        if (i % 3 === 0) text += " conforme normas aplicáveis";
        else if (i % 3 === 1) text += " durante a operação";
        else text += " no ambiente de trabalho";
        
        questions.push({
          text,
          type: questionType,
          required: i % 3 === 0, // Every third question is required
          allowAudio: true,
          allowVideo: true,
          allowPhoto: true
        });
      }
      
      toast.success(`Checklist gerado com sucesso! Revise antes de salvar.`);
      
      return {
        success: true,
        checklistData,
        questions,
        mode: "ai-review"
      };
    } catch (err: any) {
      console.error("Error generating AI checklist:", err);
      toast.error(`Erro ao gerar checklist: ${err.message}`);
      return false;
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    generateAIChecklist
  };
}
