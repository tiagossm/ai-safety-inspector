
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

// Criando uma interface estendida do User para incluir company_id
interface ExtendedUser {
  id: string;
  email: string;
  role?: string;
  tier?: string;
  company_id?: string;
  [key: string]: any;
}

export function CreateChecklistDialog() {
  const createChecklist = useCreateChecklist();
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: extendedUser?.company_id
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
      // Esta é uma simulação - na implementação real, você faria uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setForm({
        ...form,
        title: `Checklist AI: ${aiPrompt.substring(0, 30)}...`,
        description: `Checklist gerado automaticamente baseado em: ${aiPrompt}`
      });
      
      setActiveTab("manual");
    } catch (error) {
      console.error("Error generating AI checklist:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (activeTab === "manual") {
        console.log("Submitting manual form:", form);
        await createChecklist.mutateAsync(form);
      } else if (activeTab === "import" && file) {
        // Implementação da importação de arquivo estará em outro componente
        console.log("Importing from file:", file.name);
        // TODO: Implementar a importação de checklist via arquivo
      } else if (activeTab === "ai") {
        // Implementação da criação por IA estará em outro componente
        console.log("Creating checklist with AI:", aiPrompt);
        // TODO: Implementar a criação de checklist via IA
      }
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error in form submission:", error);
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
      company_id: extendedUser?.company_id
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
                (activeTab === "ai" && (!form.title || aiLoading))
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
