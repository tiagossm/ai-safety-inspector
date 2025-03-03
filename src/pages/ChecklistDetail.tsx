
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Save, Trash } from "lucide-react";
import { useChecklists, Checklist, ChecklistItem } from "@/hooks/useChecklists";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function ChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checklists, updateChecklist, createChecklist } = useChecklists();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [items, setItems] = useState<ChecklistItem[]>([]);

  // Find checklist by id or create a new one
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  useEffect(() => {
    if (id === "new") {
      // Creating a new checklist
      setChecklist({
        id: "",
        title: "Novo Checklist",
        description: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status_checklist: "ativo",
        is_template: false,
        collaborators: [],
        items: 0,
        permissions: ["editor"]
      });
      setLoading(false);
    } else if (id) {
      // Find existing checklist
      const foundChecklist = checklists.find(item => item.id === id);
      if (foundChecklist) {
        setChecklist(foundChecklist);
        // In a real implementation, you would fetch checklist items here
        setItems([]);
      } else {
        toast({
          title: "Checklist não encontrado",
          description: "O checklist solicitado não existe ou foi removido.",
          variant: "destructive"
        });
        navigate("/checklists");
      }
      setLoading(false);
    }
  }, [id, checklists, navigate, toast]);

  const form = useForm({
    defaultValues: {
      title: checklist?.title || "",
      description: checklist?.description || "",
      is_template: checklist?.is_template || false
    }
  });

  // Update form when checklist changes
  useEffect(() => {
    if (checklist) {
      form.reset({
        title: checklist.title,
        description: checklist.description || "",
        is_template: checklist.is_template
      });
    }
  }, [checklist, form]);

  const handleSave = async (data: any) => {
    if (!checklist) return;

    try {
      setLoading(true);
      if (id === "new") {
        // Create new checklist
        await createChecklist.mutateAsync({
          title: data.title,
          description: data.description,
          is_template: data.is_template
        });
        toast({
          title: "Checklist criado",
          description: "O checklist foi criado com sucesso.",
        });
        navigate("/checklists");
      } else {
        // Update existing checklist
        await updateChecklist.mutateAsync({
          id: checklist.id,
          data: {
            title: data.title,
            description: data.description,
            is_template: data.is_template
          }
        });
        toast({
          title: "Checklist atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o checklist. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = () => {
    // In a real implementation, you would add items to the database
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Adicionar itens ao checklist estará disponível em breve."
    });
  };

  if (loading || !checklist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/checklists")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Novo Checklist" : checklist.title}
          </h2>
          <p className="text-muted-foreground">
            {id === "new" 
              ? "Crie um novo modelo de checklist personalizado" 
              : "Gerencie as configurações e itens deste checklist"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações Básicas</TabsTrigger>
          <TabsTrigger value="items">Itens do Checklist</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="integration">Integração IoT</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Checklist</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Inspeção de Segurança NR-12" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva a finalidade deste checklist"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_template"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Template</FormLabel>
                          <FormDescription>
                            Marque se este checklist será usado como um modelo reutilizável
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Itens do Checklist</CardTitle>
              <Button onClick={addNewItem}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="space-y-4">
                  {/* Render checklist items here */}
                  <p className="text-muted-foreground">
                    Itens do checklist serão mostrados aqui
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Este checklist ainda não possui itens.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={addNewItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automação de Planos de Ação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure alertas automáticos e fluxos de trabalho baseados nas respostas dos checklists.
              </p>
              
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento. Disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração com Sensores IoT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Conecte sensores IoT para coletar dados automaticamente em seus checklists.
              </p>
              
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento. Disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
