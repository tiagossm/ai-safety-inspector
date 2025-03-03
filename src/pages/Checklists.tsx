
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Search, Clipboard, FileText, Users, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateChecklistDialog } from "@/components/checklists/CreateChecklistDialog";
import { DeleteChecklistDialog } from "@/components/checklists/DeleteChecklistDialog";
import { useChecklists } from "@/hooks/useChecklists";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Checklists() {
  const navigate = useNavigate();
  const { 
    checklists, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    filterType, 
    setFilterType 
  } = useChecklists();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    checklistId: string;
    checklistTitle: string;
  }>({
    open: false,
    checklistId: "",
    checklistTitle: "",
  });

  const handleOpenChecklist = (id: string) => {
    navigate(`/checklists/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({
      open: true,
      checklistId: id,
      checklistTitle: title,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">
            Gerencie seus modelos de inspeção e checklists
          </p>
        </div>
        <CreateChecklistDialog />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center flex-1 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Checklists</SelectItem>
              <SelectItem value="templates">Apenas Templates</SelectItem>
              <SelectItem value="custom">Personalizados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Grade</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>
          
          <p className="text-sm text-muted-foreground">
            {checklists.length} {checklists.length === 1 ? 'checklist' : 'checklists'} encontrados
          </p>
        </div>

        <TabsContent value="grid">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="mt-4">
                        <Skeleton className="h-7 w-28 rounded-full" />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {checklists.map((checklist) => (
                  <Card key={checklist.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {checklist.title}
                        </CardTitle>
                        {checklist.is_template && (
                          <Badge variant="secondary" className="mt-1">Template</Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenChecklist(checklist.id)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(checklist.id, checklist.title)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {checklist.description || "Sem descrição"}
                      </p>
                      <div className="mt-4 flex items-center text-sm text-muted-foreground">
                        <Check className="mr-1 h-4 w-4" />
                        <span>{checklist.items} itens</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-1">Colaboradores:</p>
                        <div className="flex -space-x-2">
                          {checklist.collaborators.map((user) => (
                            <Avatar key={user.id} className="h-7 w-7 border-2 border-background">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.initials}</AvatarFallback>
                            </Avatar>
                          ))}
                          {checklist.collaborators.length > 0 && (
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-full">
                              <Users className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => handleOpenChecklist(checklist.id)}
                      >
                        Abrir Checklist
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && checklists.length === 0 && (
              <div className="text-center py-10">
                <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum checklist encontrado</h3>
                <p className="text-muted-foreground">
                  Crie um novo checklist ou ajuste os filtros de busca.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="list">
          <div className="rounded-md border">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
              <div className="col-span-2">Nome</div>
              <div className="hidden md:block">Criado por</div>
              <div className="hidden md:block">Data</div>
              <div className="text-right">Ações</div>
            </div>
            <ScrollArea className="h-[calc(100vh-340px)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 p-4 items-center border-b">
                    <div className="col-span-2">
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="hidden md:block">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="hidden md:block">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-end">
                      <Skeleton className="h-9 w-16 mr-1" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                ))
              ) : (
                checklists.map((checklist) => (
                  <div key={checklist.id} className="grid grid-cols-5 gap-4 p-4 items-center border-b">
                    <div className="col-span-2">
                      <div className="font-medium">{checklist.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {checklist.items} itens
                        {checklist.is_template && (
                          <Badge variant="secondary" className="ml-2">Template</Badge>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block text-sm">
                      {checklist.collaborators[0]?.name || "N/A"}
                    </div>
                    <div className="hidden md:block text-sm">
                      {new Date(checklist.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenChecklist(checklist.id)}
                      >
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(checklist.id, checklist.title)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
              
              {!isLoading && checklists.length === 0 && (
                <div className="text-center py-10">
                  <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhum checklist encontrado</h3>
                  <p className="text-muted-foreground">
                    Crie um novo checklist ou ajuste os filtros de busca.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <DeleteChecklistDialog 
        checklistId={deleteDialog.checklistId}
        checklistTitle={deleteDialog.checklistTitle}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      />
    </div>
  );
}
