
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/checklists/create-forms/FormActions";
import { toast } from "sonner";
import { NewChecklist } from "@/types/newChecklist";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { ResponsibleSelector } from "@/components/inspection/ResponsibleSelector";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChecklistCreation } from "@/hooks/checklist/useChecklistCreation";

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("manual");
  
  const {
    form,
    setForm,
    users,
    isSubmitting,
    loadingUsers,
    file,
    handleFileChange,
    clearFile,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    companies,
    loadingCompanies
  } = useChecklistCreation();

  const handleSubmitWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Por favor, informe um título para o checklist");
      return;
    }
    
    try {
      const success = await handleSubmit(e);
      if (success) {
        toast.success("Checklist criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist");
    }
  };

  // Define as categorias de checklist
  const checklistCategories = [
    { value: "seguranca", label: "Segurança" },
    { value: "qualidade", label: "Qualidade" },
    { value: "meio-ambiente", label: "Meio Ambiente" },
    { value: "operacional", label: "Operacional" },
    { value: "administrativo", label: "Administrativo" },
    { value: "outro", label: "Outro" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/new-checklists")} />
          <h1 className="text-2xl font-bold">Criar Novo Checklist</h1>
        </div>
      </div>

      {/* Quick navigation buttons at the top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "manual" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("manual")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <FileText className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Criação Manual</span>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "ai" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("ai")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <Bot className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Gerado por IA</span>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "import" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("import")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <Upload className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Importar Planilha</span>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="manual">Criação Manual</TabsTrigger>
            <TabsTrigger value="ai">Gerado por IA</TabsTrigger>
            <TabsTrigger value="import">Importar Planilha</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="py-4">
            <form onSubmit={handleSubmitWrapper}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título*</Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="Título do checklist"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={form.category || "outro"}
                          onValueChange={(value) => setForm({ ...form, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {checklistCategories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <CompanySelector
                          value={form.company_id?.toString() || ""}
                          onSelect={(companyId, companyData) => setForm({ 
                            ...form, 
                            company_id: companyId === "all" ? undefined : companyId 
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="responsible">Responsável</Label>
                        <ResponsibleSelector
                          value={form.responsible_id?.toString() || "none"}
                          onSelect={(userId, userData) => setForm({ 
                            ...form, 
                            responsible_id: userId === "none" ? undefined : userId
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={form.description || ""}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          placeholder="Descrição detalhada do checklist"
                          rows={5}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-4">
                        <Switch
                          id="is_template"
                          checked={form.is_template || false}
                          onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
                        />
                        <Label htmlFor="is_template" className="cursor-pointer">
                          Criar como modelo
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={form.status_checklist !== "inativo"}
                          onCheckedChange={(checked) => setForm({ 
                            ...form, 
                            status_checklist: checked ? "ativo" : "inativo"
                          })}
                        />
                        <Label htmlFor="active" className="cursor-pointer">
                          Checklist ativo
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/new-checklists")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Criando..." : "Criar Checklist"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
          
          <TabsContent value="ai" className="py-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">Geração por IA</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    Esta funcionalidade está em desenvolvimento. Em breve você poderá gerar checklists automaticamente com IA.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">Importação de Planilha</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    Esta funcionalidade está em desenvolvimento. Em breve você poderá importar checklists de planilhas Excel ou CSV.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
