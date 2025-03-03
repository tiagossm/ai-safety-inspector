<lov-codelov-code>
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, Save, Plus, Trash2, AlertTriangle,
  FileText, ClipboardCheck, User 
} from "lucide-react";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ChecklistDetails() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    pergunta: "",
    tipo_resposta: "sim/não",
    obrigatorio: true,
    ordem: 0
  });

  const questionTypes = [
    { value: "sim/não", label: "Sim/Não" },
    { value: "numérico", label: "Numérico" },
    { value: "texto", label: "Texto" },
    { value: "foto", label: "Foto" },
    { value: "assinatura", label: "Assinatura" },
    { value: "seleção múltipla", label: "Seleção Múltipla" }
  ];

  // Fetch checklist and items data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch checklist
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();

        if (checklistError) throw checklistError;
        
        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (itemsError) throw itemsError;
        
        // Fetch users for responsible dropdown
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .order("name");
          
        if (usersError) throw usersError;
        
        // If we have a responsible_id, get their name
        let responsibleName = null;
        if (checklistData.responsible_id) {
          const foundUser = usersData.find(u => u.id === checklistData.responsible_id);
          responsibleName = foundUser?.name || 'Usuário não encontrado';
        }

        setChecklist({
          ...checklistData,
          responsible_name: responsibleName
        });
        setItems(itemsData || []);
        setUsers(usersData || []);
        
        // Set the order for new items
        if (itemsData && itemsData.length > 0) {
          const maxOrder = Math.max(...itemsData.map(item => item.ordem));
          setNewItem(prev => ({ ...prev, ordem: maxOrder + 1 }));
        }
      } catch (error) {
        console.error("Error fetching checklist data:", error);
        toast.error("Erro ao carregar dados do checklist");
      } finally {
        setLoading(false);
      }
    };

    if (checklistId) {
      fetchData();
    }
  }, [checklistId]);

  const handleSaveChecklist = async () => {
    if (!checklist) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          is_template: checklist.is_template,
          status_checklist: checklist.status_checklist,
          category: checklist.category,
          responsible_id: checklist.responsible_id
        })
        .eq("id", checklistId);

      if (error) throw error;
      
      toast.success("Checklist atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error("Erro ao atualizar checklist");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.pergunta || !checklistId) return;
    
    try {
      const { data, error } = await supabase
        .from("checklist_itens")
        .insert({
          checklist_id: checklistId,
          pergunta: newItem.pergunta,
          tipo_resposta: newItem.tipo_resposta || "sim/não",
          obrigatorio: newItem.obrigatorio === undefined ? true : newItem.obrigatorio,
          ordem: newItem.ordem || 0,
          opcoes: null
        })
        .select();

      if (error) throw error;
      
      setItems([...items, data[0]]);
      setNewItem({
        pergunta: "",
        tipo_resposta: "sim/não",
        obrigatorio: true,
        ordem: (newItem.ordem || 0) + 1
      });
      
      toast.success("Item adicionado com sucesso!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Erro ao adicionar item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      
      setItems(items.filter(item => item.id !== itemId));
      toast.success("Item removido com sucesso!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Erro ao remover item");
    }
  };

  const handleItemChange = async (updatedItem: ChecklistItem) => {
    try {
      const { error } = await supabase
        .from("checklist_itens")
        .update({
          pergunta: updatedItem.pergunta,
          tipo_resposta: updatedItem.tipo_resposta,
          obrigatorio: updatedItem.obrigatorio
        })
        .eq("id", updatedItem.id);

      if (error) throw error;
      
      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Erro ao atualizar item");
    }
  };

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center gap-4 py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-2xl font-bold">Checklist não encontrado</h2>
          <p className="text-muted-foreground">
            O checklist que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate("/checklists")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Checklists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/checklists")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
        </div>
        <Button 
          onClick={handleSaveChecklist} 
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Checklist Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={checklist.title}
              onChange={(e) => setChecklist({...checklist, title: e.target.value})}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={checklist.category || "general"} 
                onValueChange={(value) => setChecklist({...checklist, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Segurança</SelectItem>
                  <SelectItem value="quality">Qualidade</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="environment">Meio Ambiente</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="general">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Select 
                value={checklist.responsible_id || ""} 
                onValueChange={(value) => setChecklist({...checklist, responsible_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={checklist.description || ""}
              onChange={(e) => setChecklist({...checklist, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="template"
              checked={checklist.is_template}
              onCheckedChange={(checked) => setChecklist({...checklist, is_template: checked})}
            />
            <Label htmlFor="template">Template</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={checklist.status_checklist === "ativo"}
              onCheckedChange={(checked) => 
                setChecklist({
                  ...checklist, 
                  status_checklist: checked ? "ativo" : "inativo"
                })
              }
            />
            <Label htmlFor="status">
              {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Itens do Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Items */}
          {items.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhum item adicionado</h3>
              <p className="text-muted-foreground mt-1">
                Adicione perguntas a este checklist usando o formulário abaixo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-md p-4 flex flex-col md:flex-row gap-4"
                >
                  <div className="flex-grow space-y-4">
                    <div className="grid gap-2">
                      <Label>Pergunta</Label>
                      <Input
                        value={item.pergunta}
                        onChange={(e) => handleItemChange({
                          ...item,
                          pergunta: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Tipo de Resposta</Label>
                        <Select 
                          value={item.tipo_resposta} 
                          onValueChange={(value: any) => handleItemChange({
                            ...item,
                            tipo_resposta: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2 md:justify-end md:h-10">
                        <Switch
                          id={`required-${item.id}`}
                          checked={item.obrigatorio}
                          onCheckedChange={(checked) => handleItemChange({
                            ...item,
                            obrigatorio: checked
                          })}
                        />
                        <Label htmlFor={`required-${item.id}`}>Obrigatório</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col justify-end gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Item */}
          <div className="border rounded-md p-4 space-y-4 mt-6">
            <h3 className="text-lg font-medium">Adicionar Novo Item</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-question">Pergunta</Label>
                <Input
                  id="new-question"
                  value={newItem.pergunta}
                  onChange={(e) => setNewItem({...newItem, pergunta: e.target.value})}
                  placeholder="Digite a pergunta..."
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-type">Tipo de Resposta</Label>
                  <Select 
                    value={newItem.tipo_resposta} 
                    onValueChange={(value: any) => setNewItem({...newItem, tipo_resposta: value})}
                  >
                    <SelectTrigger id="new-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 md:justify-end md:h-10">
                  <Switch
                    id="new-required"
                    checked={newItem.obrigatorio}
                    onCheckedChange={(checked) => setNewItem({...newItem, obrigatorio: checked})}
                  />
                  <Label htmlFor="new-required">Obrigatório</Label>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAddItem}
              disabled={!newItem.pergunta}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
</lov-code>
