
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

// Função para validar UUIDs
function isValidUUID(id: string | null | undefined): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof id === "string" && uuidRegex.test(id);
}

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  const generateAIChecklist = async (form: NewChecklist) => {
    try {
      setAiLoading(true);

      // 🔄 Atualiza a sessão para garantir um token válido
      await refreshSession();

      // 🔍 Obtém a sessão atualizada
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("❌ Erro de sessão:", sessionError);
        toast.error("Sessão inválida. Faça login novamente.");
        setAiLoading(false);
        return false;
      }

      console.log("🔹 Preparando requisição para IA:", {
        prompt: aiPrompt,
        num_questions: numQuestions,
        category: form.category || "general",
        user_id: typedUser?.id,
        company_id: form.company_id,
      });

      // ✅ Garante que user_id está definido
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
      }

      if (!isValidUUID(form.user_id)) {
        console.error("❌ ID do usuário inválido:", form.user_id);
        toast.error("Erro ao validar usuário. Faça login novamente.");
        setAiLoading(false);
        return false;
      }

      if (form.company_id && !isValidUUID(form.company_id)) {
        console.warn("⚠️ ID da empresa inválido ou indefinido. Continuando sem empresa...");
        form.company_id = null;
      }

      // 📌 Criar checklist na base de dados
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: form.title || `Checklist: ${aiPrompt.substring(0, 50)}`,
          description: `Gerado por IA: ${aiPrompt}`,
          category: form.category || "general",
          user_id: form.user_id,
          company_id: form.company_id,
          status_checklist: "ativo",
          is_template: form.is_template || false,
        })
        .select()
        .single();

      if (checklistError || !checklist) {
        console.error("❌ Erro ao criar checklist:", checklistError);
        toast.error(`Erro ao criar checklist: ${checklistError.message}`);
        setAiLoading(false);
        return false;
      }

      if (!isValidUUID(checklist?.id)) {
        console.error("❌ ID do checklist inválido retornado:", checklist?.id);
        toast.error("Erro inesperado ao criar checklist.");
        setAiLoading(false);
        return false;
      }

      console.log("✅ Checklist criado com sucesso:", checklist.id);

      // 🔹 Criar perguntas do checklist com base na categoria
      const questionTypes = ["sim/não", "texto", "numérico", "sim/não", "múltipla escolha"];
      const questions = [];
      const baseQuestions = {
        safety: [
          "Os EPIs estão sendo utilizados corretamente?",
          "Existem extintores de incêndio em todos os locais necessários?",
          "As rotas de evacuação estão devidamente sinalizadas?",
          "Os funcionários receberam treinamento adequado para emergências?",
        ],
        quality: [
          "Os produtos atendem às especificações técnicas?",
          "Existe um sistema de controle de qualidade implementado?",
          "Os instrumentos de medição estão calibrados?",
          "São realizadas inspeções periódicas nos produtos finais?",
        ],
        maintenance: [
          "Os equipamentos receberam manutenção preventiva conforme cronograma?",
          "Há registro de manutenções corretivas recentes?",
          "As peças de reposição estão disponíveis em estoque?",
          "Os manuais técnicos estão acessíveis aos técnicos?",
        ],
        environment: [
          "Os resíduos são separados corretamente?",
          "Existe um sistema de tratamento de efluentes?",
          "As licenças ambientais estão em dia?",
          "Há medidas para redução de consumo de água?",
        ],
        operational: [
          "Os procedimentos operacionais padrão (POPs) estão disponíveis?",
          "Os funcionários seguem as instruções de trabalho?",
          "A produtividade está dentro das metas estabelecidas?",
          "Há registros de paradas não programadas?",
        ],
        general: [
          "A documentação está atualizada e organizada?",
          "O ambiente de trabalho está limpo e organizado?",
          "Os colaboradores possuem as ferramentas necessárias?",
          "Os processos estão documentados e acessíveis?",
        ],
      };

      const category = form.category as keyof typeof baseQuestions || "general";
      const categoryQuestions = baseQuestions[category] || baseQuestions.general;

      // Adicionar perguntas básicas
      for (let i = 0; i < Math.min(categoryQuestions.length, numQuestions); i++) {
        questions.push({
          checklist_id: checklist.id,
          pergunta: categoryQuestions[i],
          tipo_resposta: "sim/não",
          obrigatorio: true,
          ordem: i + 1,
        });
      }

      // Gerar perguntas adicionais
      const keywords = aiPrompt.toLowerCase().split(" ");
      for (let i = categoryQuestions.length; i < numQuestions; i++) {
        const questionType = questionTypes[i % questionTypes.length];
        const keyword = keywords[i % keywords.length] || "segurança";

        let pergunta = `Verificar condições de ${keyword}`;
        if (i % 3 === 0) pergunta += " conforme normas aplicáveis";
        else if (i % 3 === 1) pergunta += " durante a operação";
        else pergunta += " no ambiente de trabalho";

        questions.push({
          checklist_id: checklist.id,
          pergunta,
          tipo_resposta: questionType,
          obrigatorio: i % 3 === 0,
          ordem: i + 1,
        });
      }

      // 📌 Inserir perguntas no banco
      const { error: questionError } = await supabase
        .from("checklist_itens")
        .insert(questions);

      if (questionError) {
        console.error("❌ Erro ao inserir perguntas:", questionError);
        toast.error(`Erro ao adicionar perguntas: ${questionError.message}`);
      }

      toast.success(`Checklist gerado com sucesso! Revise antes de salvar.`);
      
      // Prepare the data for the editor - CORRECTED
      const checklistData = {
        ...form,
        id: checklist.id,
        title: checklist.title,
        description: checklist.description,
        category: checklist.category,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist,
      };
      
      const formattedQuestions = questions.map(q => ({
        text: q.pergunta,
        type: q.tipo_resposta,
        required: q.obrigatorio,
      }));
      
      return {
        success: true,
        checklistId: checklist.id,
        checklistData: checklistData,
        questions: formattedQuestions,
        mode: "ai-review",
      };
    } catch (err) {
      console.error("❌ Erro ao gerar checklist:", err);
      toast.error("Erro ao gerar checklist. Tente novamente.");
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
    generateAIChecklist,
  };
}
