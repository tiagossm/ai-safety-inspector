import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Plus,
  ChevronsUpDown,
  Check,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ChecklistWithStats } from "@/types/newChecklist";
import { useChecklists } from "@/hooks/new-checklist/useChecklists";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ChecklistCard } from "@/components/new-checklist/ChecklistCard";
import { ChecklistListItem } from "@/components/new-checklist/ChecklistListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { InputSearch } from "@/components/ui/InputSearch";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { ChecklistsHeader } from "@/components/checklists/ChecklistsHeader";
import { formatDate } from "@/utils/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";

interface UseChecklistsReturn {
  checklists: ChecklistWithStats[];
  loading: boolean;
  error: string;
  refetch: () => void;
  total: number;
}

const useLocalChecklists = ({ search, page, perPage, sort, sortColumn }: {
  search: string;
  page: number;
  perPage: number;
  sort: "asc" | "desc";
  sortColumn: string;
}): UseChecklistsReturn => {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("checklists")
        .select("*, companies(fantasy_name)", { count: "exact" });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (sortColumn) {
        query = query.order(sortColumn, { ascending: sort === "asc" });
      }

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedData: ChecklistWithStats[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status_checklist === "ativo" ? "active" : "inactive",
        category: item.category,
        isTemplate: item.is_template,
        companyId: item.company_id,
        companyName: item.companies?.fantasy_name || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        responsibleId: item.responsible_id,
        userId: item.user_id,
        totalQuestions: 0,
        completedQuestions: 0,
        questions: [],
        groups: [],
        origin: item.origin as "manual" | "ia" | "csv"
      }));

      setChecklists(transformedData);
      setTotal(count || 0);
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      setError(err.message || "Error fetching checklists");
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, [search, page, perPage, sort, sortColumn]);

  return {
    checklists,
    loading,
    error,
    refetch: fetchChecklists,
    total
  };
};

const updateBatchChecklistsStatus = async (ids: string[], newStatus: "active" | "inactive"): Promise<void> => {
  try {
    const { error } = await supabase
      .from("checklists")
      .update({ status: newStatus })
      .in("id", ids);

    if (error) {
      console.error("Error updating checklists status:", error);
      toast.error("Erro ao atualizar status dos checklists");
      return;
    }

    toast.success(`Status de ${ids.length} checklists atualizado com sucesso`);
  } catch (error) {
    console.error("Error updating checklists:", error);
    toast.error("Erro ao atualizar status dos checklists");
  }
};

export default function NewChecklists() {
  const navigate = useNavigate();
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<string>("title");
  const [isDeleting, setIsDeleting] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const { toast } = useToast();

  const {
    checklists,
    loading,
    error,
    total,
    refetch,
  } = useLocalChecklists({
    search,
    page,
    perPage,
    sort,
    sortColumn,
  });

  const handleOpenChecklist = (id: string) => {
    navigate(`/new-checklists/${id}`);
  };

  const handleEditChecklist = (id: string) => {
    navigate(`/new-checklists/${id}/edit`);
  };

  const handleDeleteChecklist = async (id: string, title: string) => {
    setChecklistToDelete({ id, title });
  };

  const confirmDeleteChecklist = async () => {
    if (!checklistToDelete) return;

    setIsDeleting(true);
    try {
      const { data, error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistToDelete.id);

      if (error) {
        console.error("Error deleting checklist:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir checklist",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Checklist excluído com sucesso!",
        description: `O checklist "${checklistToDelete.title}" foi excluído.`,
      });
      refetch();
    } finally {
      setIsDeleting(false);
      setChecklistToDelete(null);
    }
  };

  const handleSelectChecklist = (id: string, selected: boolean) => {
    setSelectedChecklists((prev) =>
      selected
        ? [...prev, id]
        : prev.filter((checklistId) => checklistId !== id)
    );
  };

  const handleSelectAllChecklists = (checked: boolean) => {
    setIsAllSelected(checked);
    setSelectedChecklists(checked ? checklists.map((c) => c.id) : []);
  };

  const handleBatchUpdateStatus = async (newStatus: "active" | "inactive") => {
    if (selectedChecklists.length === 0) {
      toast({
        title: "Nenhum checklist selecionado",
        description: "Selecione pelo menos um checklist para alterar o status.",
      });
      return;
    }

    setIsBatchUpdating(true);
    try {
      await updateBatchChecklistsStatus(selectedChecklists, newStatus);
      toast({
        title: "Checklists atualizados com sucesso!",
        description: `O status dos checklists selecionados foi alterado para "${newStatus}".`,
      });
      refetch();
    } finally {
      setIsBatchUpdating(false);
      setSelectedChecklists([]);
      setIsAllSelected(false);
    }
  };

  const isLoading = loading;

  return (
    <div className="space-y-6">
      <ChecklistsHeader />
      
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
          <CardDescription>
            Use os filtros abaixo para refinar a lista de checklists.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <InputSearch
              placeholder="Buscar checklists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {selectedChecklists.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Ações em lote ({selectedChecklists.length})
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleBatchUpdateStatus("active")}
                    disabled={isBatchUpdating}
                  >
                    Ativar selecionados
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBatchUpdateStatus("inactive")}
                    disabled={isBatchUpdating}
                  >
                    Desativar selecionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Checklists</CardTitle>
          <CardDescription>
            Gerencie seus checklists e acompanhe seu progresso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-10 items-center gap-4 p-4 rounded-md transition-all border border-slate-200 shadow-sm min-h-[72px]"
                >
                  <div className="col-span-1 flex items-center">
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <div className="col-span-4">
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                  <div className="col-span-2 flex justify-end space-x-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : checklists.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">
                Nenhum checklist encontrado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:flex items-center p-2 rounded-md bg-muted">
                <div className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAllChecklists}
                  />
                </div>
                <div className="w-1/4">Título</div>
                <div className="w-1/4">Empresa</div>
                <div className="w-1/6">Status</div>
                <div className="w-1/6">Criado em</div>
                <div className="w-1/6 text-right">Ações</div>
              </div>
              {checklists.map((checklist) => (
                <ChecklistListItem
                  key={checklist.id}
                  checklist={checklist}
                  onOpen={handleOpenChecklist}
                  onEdit={handleEditChecklist}
                  onDelete={handleDeleteChecklist}
                  isSelected={selectedChecklists.includes(checklist.id)}
                  onSelect={handleSelectChecklist}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Select
          value={perPage.toString()}
          onValueChange={(value) => setPerPage(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Resultados por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            <SelectItem value="30">30 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setPage((prev) => Math.max(prev - 1, 1));
              }}
            />
            {page > 2 && (
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setPage(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}
            {page > 3 && <PaginationEllipsis />}
            {page > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setPage((prev) => prev - 1);
                  }}
                >
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                }}
                isActive
              >
                {page}
              </PaginationLink>
            </PaginationItem>
            {page < Math.ceil(total / perPage) && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setPage((prev) => prev + 1);
                  }}
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            {page < Math.ceil(total / perPage) - 2 && <PaginationEllipsis />}
            {page < Math.ceil(total / perPage) - 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    setPage(Math.ceil(total / perPage));
                  }}
                >
                  {Math.ceil(total / perPage)}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationNext
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setPage((prev) =>
                  Math.min(prev + 1, Math.ceil(total / perPage))
                );
              }}
            />
          </PaginationContent>
        </Pagination>
      </div>

      <DeleteChecklistDialog
        checklistId={checklistToDelete?.id || ""}
        checklistTitle={checklistToDelete?.title || ""}
        isOpen={!!checklistToDelete}
        onOpenChange={(open: boolean) =>
          open ? null : setChecklistToDelete(null)
        }
        onDeleted={confirmDeleteChecklist}
        isDeleting={isDeleting}
      />
    </div>
  );
}
