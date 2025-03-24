
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export default function NewInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          console.error("Checklist ID not provided in URL params");
          toast.error("ID do checklist não fornecido");
          navigate("/new-checklists");
          return;
        }
        
        console.log("Fetching checklist with ID:", id);
        
        const { data, error } = await supabase
          .from("checklists")
          .select(`
            id, 
            title, 
            description, 
            category,
            company_id,
            responsible_id
          `)
          .eq("id", id)
          .single();
        
        if (error) {
          console.error("Error fetching checklist:", error);
          throw error;
        }
        
        console.log("Fetched checklist:", data);
        
        if (!data) {
          toast.error("Checklist não encontrado");
          navigate("/new-checklists");
          return;
        }
        
        // Also fetch questions for the checklist
        const { data: questions, error: questionsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", id)
          .order("ordem", { ascending: true });
        
        if (questionsError) {
          console.error("Error fetching checklist questions:", questionsError);
          throw questionsError;
        }
        
        console.log(`Fetched ${questions?.length || 0} questions for checklist`);
        
        setChecklist({
          ...data,
          questions: questions || []
        });
      } catch (error) {
        console.error("Error in fetchChecklist:", error);
        toast.error("Erro ao carregar checklist: " + (error instanceof Error ? error.message : "Erro desconhecido"));
        navigate("/new-checklists");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChecklist();
  }, [id, navigate]);

  const createInspection = async () => {
    try {
      setCreating(true);
      
      if (!id) {
        console.error("Checklist ID not provided");
        toast.error("ID do checklist não fornecido");
        return;
      }
      
      if (!user) {
        console.error("User not authenticated");
        toast.error("Usuário não autenticado");
        return;
      }
      
      console.log("Creating new inspection for checklist:", id);
      
      // Get company CNAE if available
      let cnae = "";
      if (checklist.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("cnae")
          .eq("id", checklist.company_id)
          .single();
          
        cnae = companyData?.cnae || "";
      }
      
      // Create the inspection
      const { data, error } = await supabase
        .from("inspections")
        .insert({
          checklist_id: id,
          user_id: user.id,
          company_id: checklist.company_id,
          responsible_id: checklist.responsible_id,
          status: "Pendente",
          cnae: cnae,
          checklist: {
            id: checklist.id,
            title: checklist.title,
            questions: checklist.questions.map((q: any) => ({
              id: q.id,
              text: q.pergunta,
              type: q.tipo_resposta,
              required: q.obrigatorio,
              options: q.opcoes,
              allows_photo: q.permite_foto,
              allows_video: q.permite_video,
              allows_audio: q.permite_audio
            }))
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating inspection:", error);
        throw error;
      }
      
      console.log("Created inspection:", data);
      
      toast.success("Inspeção criada com sucesso!");
      
      // Navigate to the inspection detail page
      // TODO: Update this navigation when inspection page is implemented
      navigate(`/inspections/${data.id}`);
    } catch (error) {
      console.error("Error in createInspection:", error);
      toast.error("Erro ao criar inspeção: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando detalhes do checklist...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Checklist não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O checklist solicitado não existe ou você não tem permissão para acessá-lo.
        </p>
        <Button onClick={() => navigate("/new-checklists")}>
          Voltar para Checklists
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Iniciar Nova Inspeção</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes para iniciar uma nova inspeção com o checklist selecionado.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Título</h3>
              <p>{checklist.title}</p>
            </div>
            
            {checklist.description && (
              <div>
                <h3 className="font-medium">Descrição</h3>
                <p>{checklist.description}</p>
              </div>
            )}
            
            {checklist.category && (
              <div>
                <h3 className="font-medium">Categoria</h3>
                <p>{checklist.category}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium">Número de Perguntas</h3>
              <p>{checklist.questions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/new-checklists/${id}`)}
        >
          Cancelar
        </Button>
        <Button 
          onClick={createInspection}
          disabled={creating}
        >
          {creating ? "Criando..." : "Iniciar Inspeção"}
        </Button>
      </div>
    </div>
  );
}
