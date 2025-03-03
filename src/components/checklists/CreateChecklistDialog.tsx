
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, User, Upload, Bot } from "lucide-react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

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
    company_id: user?.company_id
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
      company_id: user?.company_id
    });
    setFile(null);
    setAiPrompt("");
    setNumQuestions(10);
    setActiveTab("manual");
  };

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
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Checklist *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Checklist NR-12 para Máquinas"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={form.category} 
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="responsible">Responsável</Label>
                  <Select 
                    value={form.responsible_id || ""} 
                    onValueChange={(value) => setForm({ ...form, responsible_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva a finalidade deste checklist..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template"
                    checked={form.is_template}
                    onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
                  />
                  <Label htmlFor="template">
                    Salvar como template
                  </Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="import-file">Selecione um arquivo CSV ou Excel</Label>
                  <Input 
                    id="import-file" 
                    type="file" 
                    accept=".csv,.xlsx,.xls" 
                    onChange={handleFileChange}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {file.name}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category-import">Categoria</Label>
                  <Select 
                    value={form.category} 
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="responsible-import">Responsável</Label>
                  <Select 
                    value={form.responsible_id || ""} 
                    onValueChange={(value) => setForm({ ...form, responsible_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-import"
                    checked={form.is_template}
                    onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
                  />
                  <Label htmlFor="template-import">
                    Salvar como template
                  </Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ai-prompt">Descreva o checklist que deseja criar</Label>
                  <Textarea 
                    id="ai-prompt" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Gerar um checklist de inspeção de segurança para máquinas baseado na NR-12"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="num-questions">Número de perguntas</Label>
                  <Input 
                    id="num-questions" 
                    type="number" 
                    min={5} 
                    max={50} 
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category-ai">Categoria</Label>
                  <Select 
                    value={form.category} 
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="responsible-ai">Responsável</Label>
                  <Select 
                    value={form.responsible_id || ""} 
                    onValueChange={(value) => setForm({ ...form, responsible_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="button"
                  onClick={generateAIChecklist}
                  disabled={!aiPrompt || aiLoading}
                  className="w-full"
                >
                  {aiLoading ? "Gerando..." : "Gerar Checklist com IA"}
                </Button>
              </div>
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
