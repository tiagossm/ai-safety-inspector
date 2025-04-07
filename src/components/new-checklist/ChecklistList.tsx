
import React, { useState, useEffect } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  FileText, 
  MoreHorizontal, 
  Sparkle,
  Pen,
  FileDown,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface ChecklistListProps {
  checklists: ChecklistWithStats[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onOpen: (id: string) => void;
  onStatusChange?: () => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function ChecklistList({
  checklists,
  isLoading,
  onEdit,
  onDelete,
  onOpen,
  onStatusChange,
  onBulkDelete
}: ChecklistListProps) {
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Reset selected checklists when the checklist list changes
  useEffect(() => {
    setSelectedChecklists([]);
  }, [checklists]);

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
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          <span className="text-sm font-medium">
            {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist selecionado' : 'checklists selecionados'}
          </span>
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
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  checked={selectedChecklists.length === filteredChecklists.length && filteredChecklists.length > 0}
                  // Remove the indeterminate prop and use aria-checked instead
                  aria-checked={selectedChecklists.length > 0 && selectedChecklists.length < filteredChecklists.length ? 'mixed' : undefined}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecklists.map((checklist) => (
              <ChecklistRow
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
          </TableBody>
        </Table>
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

function ChecklistRow({
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
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState<boolean>(!!checklist.companyId);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  
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
  useEffect(() => {
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
    <TableRow
      className="cursor-pointer hover:bg-accent/50"
      onClick={() => onOpen(checklist.id)}
    >
      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={(checked) => onSelect(!!checked)} 
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getCreationTypeIcon()}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[250px]">{checklist.title}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{checklist.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
      <TableCell>
        {companyLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : companyName ? (
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>{companyName}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{companyName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {checklist.category ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[150px] inline-block">{checklist.category}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{checklist.category}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {checklist.isTemplate ? (
            <Badge variant="secondary">Template</Badge>
          ) : (
            <>
              <Badge variant={checklist.status === "active" ? "default" : "outline"}>
                {checklist.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <Switch 
                checked={checklist.status === 'active'}
                onClick={handleToggleStatus}
                disabled={isToggling}
                aria-label="Toggle status"
                className="ml-1"
              />
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        {checklist.createdAt && format(new Date(checklist.createdAt), "dd MMM yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onOpen(checklist.id);
            }}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(checklist.id);
            }}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(checklist.id, checklist.title);
              }}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
