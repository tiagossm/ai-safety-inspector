
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ui/use-toast";

export function useChecklistCreation() {
  const navigate = useNavigate();
  const createChecklist = useCreateChecklist();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("manual");
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: undefined,
    due_date: null
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [questions, setQuestions] = useState<Array<{
    text: string,
    type: string,
    required: boolean
  }>>([{ text: "", type: "texto", required: true }]);

  // Fetch users for the responsible field
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name');
        
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", type: "texto", required: true }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const generateAIChecklist = async () => {
    if (!aiPrompt) return;
    
    setAiLoading(true);
    
    try {
      console.log("Generating checklist with AI using prompt:", aiPrompt);
      
      // Call the edge function to generate the checklist
      const { data, error } = await supabase.functions.invoke("generate-checklist", {
        body: { 
          prompt: aiPrompt,
          num_questions: numQuestions,
          category: form.category
        }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.data) {
        console.log("AI generated checklist data:", data.data);
        
        // Update the form with generated data
        setForm({
          ...form,
          title: data.data.title || `Checklist AI: ${aiPrompt.substring(0, 30)}...`,
          description: data.data.description || `Checklist gerado automaticamente baseado em: ${aiPrompt}`
        });
        
        // Create the checklist
        const newChecklist = await createChecklist.mutateAsync({
          ...form,
          title: data.data.title || `Checklist AI: ${aiPrompt.substring(0, 30)}...`,
          description: data.data.description || `Checklist gerado automaticamente baseado em: ${aiPrompt}`
        });
        
        // If questions were generated, add them to the checklist
        if (data.data.questions && data.data.questions.length > 0 && newChecklist?.id) {
          console.log("Adding AI generated questions to checklist:", newChecklist.id);
          
          for (const question of data.data.questions) {
            await supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklist.id,
                pergunta: question.pergunta,
                tipo_resposta: question.tipo_resposta || "sim/não",
                obrigatorio: question.obrigatorio !== undefined ? question.obrigatorio : true,
                ordem: question.ordem || 0
              });
          }
          
          toast.success(`Checklist criado com ${data.data.questions.length} perguntas`);
        }
        
        navigate("/checklists");
      } else {
        toast.error("Erro ao gerar checklist com IA");
      }
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      toast.error("Erro ao gerar checklist com IA");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() && activeTab !== "ai") {
      toast.error("O título é obrigatório");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeTab === "manual") {
        console.log("Submitting manual form:", form);
        const newChecklist = await createChecklist.mutateAsync(form);
        
        // Add questions to the created checklist
        if (newChecklist?.id && questions.length > 0) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.text.trim()) {
              await supabase
                .from("checklist_itens")
                .insert({
                  checklist_id: newChecklist.id,
                  pergunta: q.text,
                  tipo_resposta: q.type,
                  obrigatorio: q.required,
                  ordem: i
                });
            }
          }
        }
        
        navigate("/checklists");
      } else if (activeTab === "import" && file) {
        console.log("Importing from file:", file.name);
        
        // Create a FormData instance
        const formData = new FormData();
        formData.append('file', file);
        
        // Add form data as JSON string
        formData.append('form', JSON.stringify(form));
        
        // Call the edge function to process the file
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-checklist-csv`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: formData
          }
        );
        
        const result = await response.json();
        
        if (result.success) {
          toast.success("Checklist importado com sucesso!");
          navigate("/checklists");
        } else {
          throw new Error(result.error || "Erro ao importar checklist");
        }
      } else if (activeTab === "ai") {
        await generateAIChecklist();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    form,
    setForm,
    users,
    isSubmitting,
    loadingUsers,
    file,
    handleFileChange,
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    navigate
  };
}
