
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, MapPin, Building, User, Users, FileText, Tag } from "lucide-react";
import { InspectionDataForm } from "./InspectionDataForm";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShareQRCodeButton } from "./ShareQRCodeButton";

interface InspectionExpandablePanelProps {
  inspection: any;
  company: any;
  responsible: any;
  responsibles: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  editMode: boolean;
  setEditMode: (edit: boolean) => void;
  onSave: () => void;
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
  
  const handleSaveForm = async (formData: any) => {
    setIsSaving(true);
    try {
      // Here we'd normally save the data
      // For now we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 800));
      setEditMode(false);
      onSave();
    } catch (error) {
      console.error("Error saving inspection data:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="mb-6 overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={onToggleExpand}
      >
        <h2 className="text-lg font-medium">Dados da Inspeção</h2>
        <Button variant="ghost" size="icon" onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t">
          {editMode && isEditable ? (
            <InspectionDataForm
              inspection={inspection}
              company={company}
              responsible={responsible}
              responsibles={responsibles}
              onSave={handleSaveForm}
              onCancel={() => setEditMode(false)}
              isSaving={isSaving}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{company?.name || "Não especificada"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p className="font-medium">{responsible?.name || "Não especificado"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data Agendada</p>
                    <p className="font-medium">
                      {inspection.scheduled_date 
                        ? format(new Date(inspection.scheduled_date), "PPP", { locale: ptBR }) 
                        : "Não especificada"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium">{inspection.location || "Não especificada"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo & Prioridade</p>
                    <div className="flex gap-2 items-center">
                      <span className="font-medium">{inspection.type || "Padrão"}</span>
                      {inspection.priority && (
                        <Badge 
                          className={`
                            ${inspection.priority === "high" ? "bg-red-500" : 
                              inspection.priority === "medium" ? "bg-amber-500" : 
                              "bg-blue-500"} 
                            text-white
                          `}
                        >
                          {inspection.priority === "high" ? "Alta" : 
                           inspection.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Anotações</p>
                    <p className="font-medium line-clamp-2">{inspection.notes || "Sem anotações"}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <ShareQRCodeButton inspectionId={inspection.id} />
                </div>
                
                {isEditable && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditMode(true);
                    }}
                    variant="outline"
                  >
                    Editar Dados
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
