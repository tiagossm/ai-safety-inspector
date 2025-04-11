import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChecklistWithStats } from "@/types/newChecklist";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { ChecklistCardBadges } from "./ChecklistCardBadges";
import { ChecklistProgressBar } from "./ChecklistProgressBar";
import { ChecklistCardActions } from "./ChecklistCardActions";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistCardProps {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export const ChecklistCard = ({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  isSelected = false,
  onSelect
}: ChecklistCardProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const [status, setStatus] = useState(checklist.status);
  
  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    // Optimistic UI update
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    setIsToggling(true);
    
    try {
      const { data, error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklist.id);
      
      if (error) throw error;
      
      toast.success(newStatus === 'active' ? "Checklist ativado" : "Checklist desativado");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      // Rollback on error
      setStatus(status);
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card 
      className={`h-full flex flex-col border border-slate-200 shadow-sm rounded-xl transition-all
        ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:shadow-md'}`}
      onClick={() => onOpen(checklist.id)}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-2 mb-1">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(checklist.id, checked === true)}
                  onClick={(e) => e.stopPropagation()}
                  className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />
              )}
              
              <ChecklistCardBadges checklist={checklist} status={status} />
            </div>
            
            <h3 className="text-base font-medium line-clamp-2 mb-1">{checklist.title}</h3>
            
            {checklist.companyName ? (
              <p className="text-sm text-muted-foreground truncate">
                {checklist.companyName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sem empresa associada
              </p>
            )}
          </div>
          
          <ChecklistCardActions 
            id={checklist.id}
            title={checklist.title}
            status={status}
            isTemplate={checklist.isTemplate}
            isToggling={isToggling}
            onToggleStatus={toggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        
        <div className="mt-auto">
          {checklist.category && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs font-normal">
                {checklist.category}
              </Badge>
            </div>
          )}
          
          <ChecklistProgressBar 
            totalQuestions={checklist.totalQuestions} 
            completedQuestions={checklist.completedQuestions || 0} 
          />
          
          <div className="text-xs text-muted-foreground mt-3">
            Criado em {formatDate(checklist.createdAt || "")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
