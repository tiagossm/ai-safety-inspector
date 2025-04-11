import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus, ArrowLeft } from "lucide-react";
import { useChecklists } from "@/hooks/new-checklist/useChecklists";
import { DeleteChecklistDialog } from "@/components/new-checklist/DeleteChecklistDialog";
import { ChecklistRow } from "@/components/new-checklist/ChecklistRow";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChecklistDuplicate } from "@/hooks/new-checklist/useChecklistDuplicate";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 10;

export default function NewChecklists() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isDeletingChecklist, setIsDeletingChecklist] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isTemplateFilterEnabled, setIsTemplateFilterEnabled] = useState(false);
  
  const { toast } = useToast();
  
  const { data: checklistsData, isLoading, error, refreshChecklists } = useChecklists({
    page: page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    isTemplate: isTemplateFilterEnabled
  });
  
  const { mutateAsync: duplicateChecklist } = useChecklistDuplicate();
  
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params);
  }, [search, page, setSearchParams]);
  
  const totalPages = checklistsData ? Math.ceil(checklistsData.total / PAGE_SIZE) : 0;
  
  const handleDuplicate = async (checklistId) => {
    setIsDuplicating(true);
    try {
      await duplicateChecklist(checklistId);
      toast({
        title: "Checklist Duplicado",
        description: "O checklist foi duplicado com sucesso."
      });
      await refreshChecklists();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Duplicar",
        description: "Houve um erro ao duplicar o checklist."
      });
    } finally {
      setIsDuplicating(false);
    }
  };
  
  const handleOpenDeleteDialog = (checklist) => {
    setSelectedChecklist(checklist);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setSelectedChecklist(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleDeleteChecklist = async () => {
    if (!selectedChecklist) return;
    setIsDeletingChecklist(true);
    try {
      const { error } = await supabase.from("checklists").delete().eq("id", selectedChecklist.id);
      if (error) {
        console.error("Error deleting checklist:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir checklist"
        });
      } else {
        toast({
          title: "Checklist excluído com sucesso"
        });
        await refreshChecklists();
      }
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir checklist"
      });
    } finally {
      setIsDeletingChecklist(false);
      handleCloseDeleteDialog();
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Checklists</h1>
        </div>
        <Button onClick={() => navigate("/new-checklists/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Checklist
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Buscar checklists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="template-filter">Mostrar Templates</Label>
              <Switch 
                id="template-filter"
                checked={isTemplateFilterEnabled}
                onCheckedChange={setIsTemplateFilterEnabled}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">Error: {error.message}</p>
          ) : checklistsData && checklistsData.data.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklistsData.data.map((checklist) => (
                    <ChecklistRow
                      key={checklist.id}
                      checklist={checklist}
                      onView={() => navigate(`/new-checklists/${checklist.id}`)}
                      onEdit={() => navigate(`/new-checklists/edit/${checklist.id}`)}
                      onDelete={() => handleOpenDeleteDialog(checklist)}
                      onDuplicate={() => handleDuplicate(checklist.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>Nenhum checklist encontrado.</p>
          )}

          {checklistsData && checklistsData.data.length > 0 && (
            <Pagination
              page={page}
              onPageChange={setPage}
              total={totalPages}
            />
          )}
        </CardContent>
      </Card>

      {isDeleteDialogOpen && selectedChecklist && (
        <DeleteChecklistDialog
          checklistId={selectedChecklist.id}
          checklistTitle={selectedChecklist.title}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDeleted={async () => {
            await refreshChecklists();
            toast.success("Checklist excluído com sucesso");
          }}
          isDeleting={isDeletingChecklist}
        />
      )}
      
      <FloatingNavigation threshold={400} />
    </div>
  );
}
