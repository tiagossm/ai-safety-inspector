
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

// Import our new components
import ChecklistHeader from "@/components/checklists/ChecklistHeader";
import ChecklistForm from "@/components/checklists/ChecklistForm";
import ChecklistItemsList from "@/components/checklists/ChecklistItemsList";
import AddChecklistItemForm from "@/components/checklists/AddChecklistItemForm";

export default function ChecklistDetails() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const questionTypes = [
    { value: "sim/não", label: "Sim/Não" },
    { value: "numérico", label: "Numérico" },
    { value: "texto", label: "Texto" },
    { value: "foto", label: "Foto" },
    { value: "assinatura", label: "Assinatura" },
    { value: "seleção múltipla", label: "Seleção Múltipla" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();

        if (checklistError) throw checklistError;
        
        const { data: itemsData, error: itemsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (itemsError) throw itemsError;
        
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .order("name");
          
        if (usersError) throw usersError;
        
        let responsibleName = null;
        if (checklistData.responsible_id) {
          const foundUser = usersData.find(u => u.id === checklistData.responsible_id);
          responsibleName = foundUser?.name || 'Usuário não encontrado';
        }

        const typedChecklist: Checklist = {
          ...checklistData,
          responsible_name: responsibleName,
          status_checklist: checklistData.status_checklist === "inativo" ? "inativo" : "ativo" as "ativo" | "inativo"
        };

        setChecklist(typedChecklist);
        
        // Convert the items to the correct type
        const typedItems: ChecklistItem[] = itemsData?.map(item => ({
          ...item,
          tipo_resposta: item.tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
          opcoes: Array.isArray(item.opcoes) ? item.opcoes : null
        })) || [];
        
        setItems(typedItems);
        setUsers(usersData || []);
        
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

  const handleAddItem = async (newItem: Partial<ChecklistItem>) => {
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
      
      const typedNewItem: ChecklistItem = {
        ...data[0],
        tipo_resposta: data[0].tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
        opcoes: null
      };
      
      setItems([...items, typedNewItem]);
      
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

  const getLastOrder = () => {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.ordem)) + 1;
  };

  return (
    <div className="container py-6 space-y-6">
      <ChecklistHeader 
        checklist={checklist}
        saving={saving}
        onSave={handleSaveChecklist}
      />

      <ChecklistForm 
        checklist={checklist}
        users={users}
        setChecklist={setChecklist}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Itens do Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ChecklistItemsList 
            items={items}
            onItemChange={handleItemChange}
            onDeleteItem={handleDeleteItem}
            questionTypes={questionTypes}
          />

          <AddChecklistItemForm 
            checklistId={checklistId!}
            onAddItem={handleAddItem}
            lastOrder={getLastOrder()}
            questionTypes={questionTypes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
