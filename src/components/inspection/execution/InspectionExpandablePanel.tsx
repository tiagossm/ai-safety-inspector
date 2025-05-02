import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { InspectionDataForm } from "./InspectionDataForm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionExpandablePanelProps {
  inspection: any;
  company: any;
  responsible: any;
  responsibles: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  onSave: (data: any) => void;
  isEditable: boolean;
}

export function InspectionExpandablePanel({
  inspection,
  company,
  responsible,
  responsibles,
  isExpanded,
  onToggleExpand,
  editMode,
  setEditMode,
  onSave,
  isEditable
}: InspectionExpandablePanelProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Check if this is a new inspection (no ID or has ID but is not fully saved - missing required data)
  const isNewInspection = !inspection.id || (!company?.id || !responsible?.id);

  // Handle form submission
  const handleSaveData = async (data: any) => {
    if (!isEditable) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would make an API call to update the inspection
      // For now, we'll simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Dados da inspeção atualizados com sucesso");
      setEditMode(false);
      onSave(data);
    } catch (error) {
      console.error("Error saving inspection data:", error);
      toast.error("Erro ao salvar dados da inspeção");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setEditMode(false);
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
      case "média":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
      case "baixa":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="mb-4">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <h3 className="font-medium flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 mr-2" />
          ) : (
            <ChevronRight className="h-5 w-5 mr-2" />
          )}
          Dados da Inspeção
        </h3>
        
        {!isExpanded && (
          <div className="flex items-center gap-2">
            {company && (
              <Badge variant="outline">
                {company?.fantasy_name || company?.name || "Empresa não definida"}
              </Badge>
            )}
            
            {inspection.priority && (
              <Badge 
                variant="outline" 
                className={getPriorityColor(inspection.priority)}
              >
                {inspection.priority === "high" ? "Alta" : 
                 inspection.priority === "medium" ? "Média" : 
                 inspection.priority === "low" ? "Baixa" : inspection.priority}
              </Badge>
            )}
            
            {inspection.scheduled_date && (
              <Badge variant="outline">
                {format(new Date(inspection.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            )}
            
            {/* Only show edit button for saved inspections with company and responsible already set */}
            {isEditable && !isNewInspection && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                  setEditMode(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          {editMode ? (
            <InspectionDataForm
              inspection={inspection}
              company={company}
              responsible={responsible}
              responsibles={responsibles}
              onSave={handleSaveData}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Empresa</h4>
                  <p className="font-medium">{company?.fantasy_name || company?.name || "Não definida"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Responsável</h4>
                  <p className="font-medium">{responsible?.name || "Não definido"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Data Agendada</h4>
                  <p className="font-medium">
                    {inspection.scheduled_date
                      ? format(new Date(inspection.scheduled_date), "PPP", { locale: ptBR })
                      : "Não definida"
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Localização</h4>
                  <p className="font-medium">{inspection.location || "Não definida"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo de Inspeção</h4>
                  <p className="font-medium">{inspection.inspection_type || inspection.type || "Padrão"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Prioridade</h4>
                  <p className="font-medium flex items-center">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(inspection.priority)}
                    >
                      {inspection.priority === "high" ? "Alta" : 
                      inspection.priority === "medium" ? "Média" : 
                      inspection.priority === "low" ? "Baixa" : inspection.priority || "Não definida"}
                    </Badge>
                  </p>
                </div>
              </div>
              
              {inspection.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Anotações</h4>
                  <p className="text-sm whitespace-pre-wrap">{inspection.notes}</p>
                </div>
              )}
              
              {/* Only show edit button for saved inspections that have company and responsible data */}
              {isEditable && !isNewInspection && (
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
