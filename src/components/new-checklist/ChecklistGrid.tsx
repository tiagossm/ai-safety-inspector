
import React, { useState } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Building2,
  Calendar,
  FileText,
  Sparkle,
  Pen,
  FileDown,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChecklistGridProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistGrid({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete
}: ChecklistGridProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChecklists(checklists.filter(c => !c.isSubChecklist).map(c => c.id));
    } else {
      setSelectedChecklists([]);
    }
  };

  const handleSelectChecklist = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedChecklists([...selectedChecklists, id]);
    } else {
      setSelectedChecklists(selectedChecklists.filter(checklistId => checklistId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (onBulkDelete && selectedChecklists.length > 0) {
      await onBulkDelete(selectedChecklists);
      setSelectedChecklists([]);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (checklists.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum checklist encontrado</h3>
        <p className="text-muted-foreground mb-6">
          Não foram encontrados checklists com os filtros atuais.
        </p>
      </div>
    );
  }

  // Filter out sub-checklists
  const filteredChecklists = checklists.filter(
    checklist => !checklist.isSubChecklist
  );

  return (
    <div className="space-y-4">
      {selectedChecklists.length > 0 && (
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all" 
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
              checked={selectedChecklists.length === filteredChecklists.length && filteredChecklists.length > 0}
              // Remove the indeterminate prop as it's not supported
              aria-checked={selectedChecklists.length > 0 && selectedChecklists.length < filteredChecklists.length ? 'mixed' : undefined}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist selecionado' : 'checklists selecionados'}
            </label>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir selecionados</span>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChecklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onStatusChange={onStatusChange}
            isSelected={selectedChecklists.includes(checklist.id)}
            onSelect={(checked) => handleSelectChecklist(checklist.id, checked)}
          />
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklists selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist' : 'checklists'}.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChecklistCard({
  checklist,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  isSelected,
  onSelect
}: {
  checklist: ChecklistWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const [companyName, setCompanyName] = React.useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = React.useState<boolean>(!!checklist.companyId);
  const [isToggling, setIsToggling] = useState(false);
  
  // Determine checklist creation type based on description patterns
  const getCreationTypeIcon = () => {
    // Check for AI generated (based on description patterns)
    if (checklist.description?.toLowerCase().includes("gerado por ia") || 
        checklist.description?.toLowerCase().includes("criado com inteligência artificial") ||
        checklist.description?.toLowerCase().includes("checklist gerado por ia") ||
        checklist.description?.toLowerCase().includes("checklist: ")) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Sparkle className="h-4 w-4 text-purple-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Gerado por IA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Check for import (based on description patterns)
    if (checklist.description?.toLowerCase().includes("importado via csv") ||
        checklist.description?.toLowerCase().includes("importado de planilha") ||
        checklist.description?.toLowerCase().includes("importado de excel")) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FileDown className="h-4 w-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Importado via CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Default to manual creation
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Pen className="h-4 w-4 text-slate-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Criado manualmente</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Fetch company name if we have companyId
  React.useEffect(() => {
    if (checklist.companyId) {
      fetchCompanyName(checklist.companyId);
    }
  }, [checklist.companyId]);

  const fetchCompanyName = async (companyId: string) => {
    try {
      setCompanyLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      if (data) {
        setCompanyName(data.fantasy_name);
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    } finally {
      setCompanyLoading(false);
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const newStatus = checklist.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('checklists')
        .update({ 
          status: newStatus,
          // Fix: Use status directly instead of status_checklist
          // status_checklist was removed from the type
          status_checklist: newStatus === 'active' ? 'ativo' : 'inativo'
        })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      // Update the local state immediately without waiting for refetch
      checklist.status = newStatus;
      
      toast.success(`Checklist ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      
      // Also call the onStatusChange callback to refetch data
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Error toggling checklist status:", error);
      toast.error("Erro ao alterar status do checklist");
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(!!checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <Badge variant={checklist.isTemplate ? "secondary" : checklist.status === "active" ? "default" : "outline"}>
              {checklist.isTemplate ? "Template" : checklist.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            {!checklist.isTemplate && (
              <Switch 
                checked={checklist.status === 'active'} 
                onClick={handleToggleStatus}
                disabled={isToggling}
                className="scale-75"
              />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(checklist.id)}>
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(checklist.id)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(checklist.id, checklist.title)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {getCreationTypeIcon()}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-md line-clamp-2 cursor-pointer hover:text-primary">
                  {checklist.title}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <p>{checklist.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {checklist.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {checklist.description}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-md">{checklist.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="flex flex-col gap-2 mt-2">
          {checklist.category && (
            <Badge variant="outline" className="w-fit">
              {checklist.category}
            </Badge>
          )}
          
          {companyLoading ? (
            <div className="flex items-center text-sm">
              <Building2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : companyName ? (
            <div className="flex items-center text-sm">
              <Building2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground truncate max-w-[200px]">{companyName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{companyName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : null}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {checklist.createdAt && format(new Date(checklist.createdAt), "dd MMM yyyy", { locale: ptBR })}
          </div>
          
          {checklist.totalQuestions !== undefined && (
            <div className="text-sm text-muted-foreground">
              {checklist.totalQuestions} {checklist.totalQuestions === 1 ? "questão" : "questões"}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onOpen(checklist.id)}
        >
          Ver detalhes
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(checklist.id)}
        >
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
