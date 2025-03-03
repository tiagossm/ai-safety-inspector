
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, Upload, Bot } from "lucide-react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ManualCreateForm } from "./create-forms/ManualCreateForm";
import { ImportCreateForm } from "./create-forms/ImportCreateForm";
import { AICreateForm } from "./create-forms/AICreateForm";
import { toast } from "sonner";

export function CreateChecklistDialog() {
  const createChecklist = useCreateChecklist();
  const { user } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: undefined // We'll handle this in the createChecklist mutation
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch users for the responsible field
  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
        
        setOpen(false);
        resetForm();
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
    
    if (!form.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeTab === "manual") {
        console.log("Submitting manual form:", form);
        await createChecklist.mutateAsync(form);
        setOpen(false);
        resetForm();
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
          setOpen(false);
          resetForm();
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

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      is_template: false,
      category: "general",
      responsible_id: "",
      company_id: undefined
    });
    setFile(null);
    setAiPrompt("");
    setNumQuestions(10);
    setActiveTab("manual");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Checklist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Checklist</DialogTitle>
            <DialogDescription>
              Escolha como deseja criar seu checklist.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Manual</span>
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Importar</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>Gerar com IA</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="py-4">
              <ManualCreateForm 
                form={form}
                setForm={setForm}
                users={users}
                loadingUsers={loadingUsers}
              />
            </TabsContent>
            
            <TabsContent value="import" className="py-4">
              <ImportCreateForm 
                form={form}
                setForm={setForm}
                users={users}
                loadingUsers={loadingUsers}
                file={file}
                onFileChange={handleFileChange}
              />
            </TabsContent>
            
            <TabsContent value="ai" className="py-4">
              <AICreateForm 
                form={form}
                setForm={setForm}
                users={users}
                loadingUsers={loadingUsers}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                numQuestions={numQuestions}
                setNumQuestions={setNumQuestions}
                onGenerateAI={generateAIChecklist}
                aiLoading={aiLoading}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || 
                (activeTab === "manual" && !form.title.trim()) ||
                (activeTab === "import" && !file) ||
                (activeTab === "ai" && (!aiPrompt.trim() || aiLoading))
              }
            >
              {isSubmitting ? "Criando..." : "Criar Checklist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
