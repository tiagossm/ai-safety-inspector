import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

// Align this with the type in AIAssistantSelector.tsx
export type AIAssistantType = "general" | "workplace-safety" | "compliance" | "quality" | "openai" | "claude" | "gemini";

// Interface for groups of perguntas
interface QuestionGroup {
  id: string;
  title: string;
  questions: any[];
}

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  // Function to normalize response types according to the database constraints
  const normalizeResponseType = (type: string): string => {
    // Map of user-friendly types to database-compatible types
    const typeMap: Record<string, string> = {
      'sim/não': 'yes_no',
      'múltipla escolha': 'multiple_choice',
      'numérico': 'numeric',
      'texto': 'text',
      'foto': 'photo',
      'assinatura': 'signature'
    };

    return typeMap[type] || 'text'; // Default to 'text' if not matched
  };

  // Get default category groups based on the selected assistant
  const getDefaultGroups = (assistantType: AIAssistantType): QuestionGroup[] => {
    let categories: string[] = [];
    
    switch (assistantType) {
      case "workplace-safety":
        categories = ["EPIs", "Ambiente de Trabalho", "Procedimentos", "Treinamentos"];
        break;
      case "compliance":
        categories = ["Documentação", "Processos", "Registros", "Auditorias"];
        break;
      case "quality":
        categories = ["Controle de Processo", "Inspeção", "Não-conformidades", "Melhorias"];
        break;
      default:
        categories = ["Geral", "Específico", "Opcional"];
    }
    
    return categories.map((title, index) => ({
      id: `group-${index + 1}`,
      title,
      questions: []
    }));
  };

  // Generate better questions based on assistant type
  const generateQuestionsForAssistant = (
    assistantType: AIAssistantType, 
    prompt: string, 
    numQuestions: number
  ): any[] => {
    const questions = [];
    const questionTypes = ["yes_no", "text", "numeric", "multiple_choice"];
    
    // Define templates based on assistant type
    const templates: Record<AIAssistantType, string[]> = {
      "workplace-safety": [
        "Os EPIs são utilizados corretamente por todos os colaboradores?",
        "A sinalização de segurança está em conformidade com a NR-26?",
        "Os equipamentos de combate a incêndio estão devidamente sinalizados?",
        "As rotas de fuga estão desobstruídas?",
        "Os colaboradores receberam treinamento adequado para os riscos da atividade?",
        "As instalações elétricas seguem as normas da NR-10?",
        "Os registros de acidentes estão atualizados?",
        "As áreas de risco possuem acesso controlado?",
        "Os equipamentos possuem proteções conforme NR-12?",
        "É realizada a análise preliminar de risco (APR) antes das atividades?"
      ],
      "compliance": [
        "A documentação legal está atualizada?",
        "Os registros obrigatórios estão sendo mantidos pelo período mínimo exigido?",
        "As licenças operacionais estão vigentes?",
        "As obrigações trabalhistas estão sendo cumpridas?",
        "Existem desvios em relação aos procedimentos internos?",
        "As auditorias são realizadas conforme cronograma?",
        "Os planos de ação das não-conformidades estão sendo executados?",
        "Os processos estão devidamente documentados?",
        "As políticas internas são divulgadas aos colaboradores?",
        "O canal de denúncias está acessível a todos?"
      ],
      "quality": [
        "Os equipamentos de medição estão calibrados?",
        "As amostras são coletadas conforme procedimento?",
        "O controle estatístico de processo é realizado?",
        "As não-conformidades são registradas e tratadas?",
        "Os indicadores de qualidade estão sendo monitorados?",
        "Os insumos são verificados no recebimento?",
        "O produto final atende às especificações?",
        "As melhorias propostas são implementadas?",
        "A rastreabilidade é mantida ao longo do processo?",
        "Os colaboradores recebem treinamento contínuo?"
      ],
      "general": [
        "A documentação está atualizada e organizada?",
        "O ambiente de trabalho está limpo e organizado?",
        "Os colaboradores possuem as ferramentas necessárias?",
        "Os processos estão documentados e acessíveis?",
        "As reuniões de acompanhamento são realizadas periodicamente?",
        "Os recursos estão sendo utilizados de forma eficiente?",
        "Os prazos estão sendo cumpridos?",
        "A comunicação entre as equipes é eficaz?",
        "O feedback dos clientes é coletado e analisado?",
        "Os objetivos e metas estão claros para todos?"
      ]
    };
    
    // Get templates for the selected assistant
    const assistantTemplates = templates[assistantType] || templates.general;
    
    // Create questions based on the templates
    for (let i = 0; i < Math.min(assistantTemplates.length, numQuestions); i++) {
      const questionType = i % 3 === 0 ? "yes_no" : 
                          i % 3 === 1 ? "text" : 
                          "multiple_choice";
                          
      // Determine which group this question should go in
      const groupId = `group-${(i % 4) + 1}`;
      
      let options = null;
      if (questionType === "multiple_choice") {
        if (assistantType === "workplace-safety") {
          options = ["Conforme", "Não conforme", "Parcialmente conforme", "Não aplicável"];
        } else if (assistantType === "compliance") {
          options = ["Atendido", "Não atendido", "Parcialmente atendido", "Não aplicável"];
        } else if (assistantType === "quality") {
          options = ["Aprovado", "Reprovado", "Necessita ajustes", "Não verificado"];
        } else {
          options = ["Sim", "Não", "Parcialmente", "Não aplicável"];
        }
      }
      
      questions.push({
        text: assistantTemplates[i],
        type: questionType === "yes_no" ? "sim/não" : 
              questionType === "text" ? "texto" : 
              "múltipla escolha",
        required: i < (numQuestions / 2),
        options: options,
        groupId: groupId
      });
    }
    
    // Generate additional questions based on the prompt
    if (numQuestions > assistantTemplates.length) {
      const keywords = prompt.toLowerCase().split(" ");
      for (let i = assistantTemplates.length; i < numQuestions; i++) {
        const questionType = questionTypes[i % questionTypes.length];
        const keyword = keywords[i % keywords.length] || "processo";
        
        let text = "";
        
        // Generate question text based on assistant type and keywords
        if (assistantType === "workplace-safety") {
          text = `Verificar condições de segurança relacionadas a ${keyword}`;
        } else if (assistantType === "compliance") {
          text = `A documentação relativa a ${keyword} está em conformidade?`;
        } else if (assistantType === "quality") {
          text = `O processo de ${keyword} atende aos padrões de qualidade?`;
        } else {
          text = `Verificar ${keyword} conforme procedimento`;
        }
        
        // Determine which group this question should go in
        const groupId = `group-${(i % 4) + 1}`;
        
        let options = null;
        if (questionType === "multiple_choice") {
          options = ["Sim", "Não", "Parcialmente", "Não aplicável"];
        }
        
        questions.push({
          text,
          type: questionType === "yes_no" ? "sim/não" : 
                questionType === "text" ? "texto" : 
                questionType === "multiple_choice" ? "múltipla escolha" : 
                "numérico",
          required: i % 2 === 0,
          options,
          groupId
        });
      }
    }
    
    return questions;
  };

  const generateAIChecklist = async (form: NewChecklist) => {
    try {
      setAiLoading(true);

      // 🔄 Atualiza a sessão para garantir um token válido
      await refreshSession();

      // 🔍 Obtém a sessão atualizada
      const sessionResponse = await supabase.auth.getSession();
      
      if (sessionResponse.error || !sessionResponse.data.session) {
        console.error("❌ Erro de sessão:", sessionResponse.error);
        toast.error("Sessão inválida. Faça login novamente.");
        setAiLoading(false);
        return false;
      }

      // Log form details for debugging
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

      // Validate company_id if present
      if (form.company_id) {
        if (!isValidUUID(form.company_id)) {
          console.warn("⚠️ ID da empresa inválido:", form.company_id);
          form.company_id = null;
        } else {
          // Verify the company exists before continuing
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('id', form.company_id)
            .single();
            
          if (companyError || !companyData) {
            console.warn("⚠️ Empresa não encontrada. Continuando sem empresa...");
            form.company_id = null;
          } else {
            console.log("✅ Empresa validada:", companyData.id);
          }
        }
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
        toast.error(`Erro ao criar checklist: ${checklistError?.message}`);
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

      // Generate questions based on the assistant type
      const questions = generateQuestionsForAssistant(
        selectedAssistant,
        aiPrompt,
        numQuestions
      );
      
      // Create default question groups
      const defaultGroups = getDefaultGroups(selectedAssistant);
      
      // Organize questions into their groups
      const groupedQuestions = defaultGroups.map(group => {
        const groupQuestions = questions.filter(q => q.groupId === group.id);
        return {
          ...group,
          questions: groupQuestions
        };
      });
      
      // 🔹 Inserir perguntas no banco
      const dbQuestions = questions.map((q, idx) => {
        // Validate and structure the question for database insertion
        if (!q.text || !q.type) {
          console.warn(`⚠️ Pulando pergunta ${idx + 1} pois está incompleta:`, q);
          return null;
        }
        
        // Ensure proper type mapping
        const dbType = normalizeResponseType(q.type);
        
        // For multiple choice, ensure options exist
        if (dbType === 'multiple_choice' && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
          console.warn(`⚠️ Adicionando opções padrão para pergunta de múltipla escolha ${idx + 1}:`, q.text);
          q.options = ["Opção 1", "Opção 2", "Opção 3"];
        }
        
        return {
          checklist_id: checklist.id,
          pergunta: q.text,
          tipo_resposta: dbType,
          obrigatorio: q.required,
          ordem: idx + 1,
          opcoes: q.options,
          // Store group info in the hint field as JSON
          hint: JSON.stringify({
            groupId: q.groupId,
            groupTitle: defaultGroups.find(g => g.id === q.groupId)?.title || 'Geral',
            groupIndex: defaultGroups.findIndex(g => g.id === q.groupId)
          })
        };
      }).filter(Boolean); // Remove any null entries

      // Log the questions being created to help with debugging
      console.log("Inserting questions with these types:", dbQuestions.map(q => q.tipo_resposta));

      if (dbQuestions.length === 0) {
        console.warn("⚠️ Nenhuma pergunta válida para inserir");
        toast.warning("Não foi possível gerar perguntas válidas. Verifique o prompt.");
      } else {
        // 📌 Inserir perguntas no banco
        const { error: questionError } = await supabase
          .from("checklist_itens")
          .insert(dbQuestions);

        if (questionError) {
          console.error("❌ Erro ao inserir perguntas:", questionError);
          toast.error(`Erro ao adicionar perguntas: ${questionError.message}`);
        } else {
          console.log("✅ Perguntas inseridas com sucesso:", dbQuestions.length);
        }
      }

      toast.success(`Checklist gerado com sucesso! Revise antes de salvar.`);
      
      // Prepare the data for the editor - with UI-friendly response types
      const checklistData = {
        ...form,
        id: checklist.id,
        title: checklist.title,
        description: checklist.description,
        category: checklist.category,
        is_template: checklist.is_template,
        status_checklist: checklist.status_checklist,
      };
      
      // Update the state of groups
      setQuestionGroups(groupedQuestions);
      
      return {
        success: true,
        checklistId: checklist.id,
        checklistData: checklistData,
        questions: questions,
        groups: groupedQuestions,
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

  // Função para validar UUIDs
  function isValidUUID(id: string | null | undefined): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof id === "string" && uuidRegex.test(id);
  }

  return {
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    selectedAssistant,
    setSelectedAssistant,
    questionGroups,
    setQuestionGroups,
    generateAIChecklist,
    getDefaultGroups
  };
}
