
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
  Trash2,
  Bot,
  CheckSquare,
  Archive
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
import { ChecklistOriginBadge } from "./ChecklistOriginBadge";

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
  const [isDeleting, setIsDeleting] = useState(false);

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
      setIsDeleting(true);
      try {
        await onBulkDelete(selectedChecklists);
        toast.success(`${selectedChecklists.length} checklists excluídos com sucesso`);
        setSelectedChecklists([]);
      } catch (error) {
        console.error("Error deleting checklists:", error);
        toast.error("Erro ao excluir checklists");
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedChecklists.length === 0) return;
    
    const statusText = newStatus === 'active' ? 'ativando' : 'desativando';
    const loadingToast = toast.loading(`${statusText} ${selectedChecklists.length} checklists...`);
    
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ 
          status: newStatus,
          status_checklist: newStatus === 'active' ? 'ativo' : 'inativo' 
        })
        .in('id', selectedChecklists);
      
      if (error) throw error;
      
      toast.success(`${selectedChecklists.length} checklists ${newStatus === 'active' ? 'ativados' : 'desativados'} com sucesso`);
      
      if (onStatusChange) onStatusChange();
      setSelectedChecklists([]);
    } catch (error) {
      console.error(`Error ${statusText} checklists:`, error);
      toast.error(`Erro ao ${statusText.replace('ando', 'ar')} checklists`);
    } finally {
      toast.dismiss(loadingToast);
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

  const filteredChecklists = checklists.filter(
    checklist => !checklist.isSubChecklist
  );

  return (
    <div className="space-y-4">
      {selectedChecklists.length > 0 && (
        <div className="sticky top-0 z-50 flex justify-between items-center p-3 bg-background border border-slate-200 rounded-lg shadow-sm">
          <span className="text-sm font-medium">
            {selectedChecklists.length} {selectedChecklists.length === 1 ? 'checklist selecionado' : 'checklists selecionados'}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkStatusChange('active')}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Ativar selecionados
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkStatusChange('inactive')}
            >
              <Archive className="h-4 w-4 mr-1" />
              Inativar selecionados
            </Button>
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
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
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
  const [companyName, setCompanyName] = useState<string | null>(checklist.companyName || null);
  const [companyLoading, setCompanyLoading] = useState<boolean>(!!checklist.companyId && !checklist.companyName);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [status, setStatus] = useState(checklist.status);

  useEffect(() => {
    if (checklist.companyId && !companyName) {
      fetchCompanyName(checklist.companyId);
    }
  }, [checklist.companyId, companyName]);

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

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling) return;
    
    // Optimistic UI update
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    setIsToggling(true);
    
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ 
          status: newStatus,
          status_checklist: newStatus === 'active' ? 'ativo' : 'inativo'
        })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      toast.success(`Checklist ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      
      if (onStatusChange) onStatusChange();
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
    <TableRow
      className="cursor-pointer hover:bg-accent/50 group"
      onClick={() => onOpen(checklist.id)}
    >
      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={(checked) => onSelect(!!checked)}
          className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </TableCell>
      <TableCell className="font-medium min-h-[56px] flex items-center gap-2 py-3">
        <ChecklistOriginBadge origin={checklist.origin} showLabel={false} />
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
          <span className="text-muted-foreground italic">Sem empresa</span>
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
          <span className="text-muted-foreground italic">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {checklist.isTemplate ? (
            <Badge variant="secondary">Template</Badge>
          ) : (
            <>
              <Badge variant={status === "active" ? "default" : "outline"}>
                {status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <Switch 
                checked={status === 'active'}
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
