
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, Search, Clipboard, FileText, Users, MoreHorizontal } from "lucide-react";
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

export default function Checklists() {
  // Estados
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Dados de exemplo para checklists
  const checklists = [
    {
      id: "1",
      title: "Checklist NR-12 - Maquinário",
      description: "Checklist para inspeção de segurança de máquinas conforme NR-12",
      createdBy: "João Silva",
      createdAt: "2023-10-15",
      items: 24,
      isTemplate: false,
      permissions: ["editor", "approver"],
      collaborators: [
        { id: "1", name: "Ana Maria", avatar: "", initials: "AM" },
        { id: "2", name: "Carlos Eduardo", avatar: "", initials: "CE" },
      ]
    },
    {
      id: "2",
      title: "Checklist Ergonômico NR-17",
      description: "Avaliação ergonômica do ambiente de trabalho",
      createdBy: "Maria Souza",
      createdAt: "2023-11-05",
      items: 18,
      isTemplate: true,
      permissions: ["viewer"],
      collaborators: [
        { id: "3", name: "Daniel Ferreira", avatar: "", initials: "DF" },
      ]
    },
    {
      id: "3",
      title: "Inspeção de EPI NR-6",
      description: "Verificação de equipamentos de proteção individual",
      createdBy: "Ricardo Oliveira",
      createdAt: "2023-11-10",
      items: 15,
      isTemplate: false,
      permissions: ["admin"],
      collaborators: [
        { id: "4", name: "Fernanda Lima", avatar: "", initials: "FL" },
        { id: "5", name: "Gabriel Santos", avatar: "", initials: "GS" },
        { id: "6", name: "Helena Costa", avatar: "", initials: "HC" },
      ]
    },
    {
      id: "4",
      title: "Checklist de Risco de Incêndio NR-23",
      description: "Avaliação de medidas de prevenção contra incêndios",
      createdBy: "Patricia Mendes",
      createdAt: "2023-11-12",
      items: 22,
      isTemplate: true,
      permissions: ["editor"],
      collaborators: [
        { id: "7", name: "Igor Martins", avatar: "", initials: "IM" },
      ]
    },
  ];

  // Filtrar checklists
  const filteredChecklists = checklists.filter(checklist => {
    // Filtrar por texto de pesquisa
    const matchesSearch = 
      checklist.title.toLowerCase().includes(search.toLowerCase()) || 
      checklist.description.toLowerCase().includes(search.toLowerCase());
    
    // Filtrar por tipo
    const matchesFilter = 
      filter === "all" || 
      (filter === "templates" && checklist.isTemplate) || 
      (filter === "custom" && !checklist.isTemplate);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checklists</h2>
          <p className="text-muted-foreground">
            Gerencie seus modelos de inspeção e checklists
          </p>
        </div>
        <Button className="self-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Checklist
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center flex-1 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar checklists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
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
            {filteredChecklists.length} {filteredChecklists.length === 1 ? 'checklist' : 'checklists'} encontrados
          </p>
        </div>

        <TabsContent value="grid">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredChecklists.map((checklist) => (
                <Card key={checklist.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {checklist.title}
                      </CardTitle>
                      {checklist.isTemplate && (
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {checklist.description}
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
                    <Button variant="secondary" className="w-full">Abrir Checklist</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredChecklists.length === 0 && (
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
              {filteredChecklists.map((checklist) => (
                <div key={checklist.id} className="grid grid-cols-5 gap-4 p-4 items-center border-b">
                  <div className="col-span-2">
                    <div className="font-medium">{checklist.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {checklist.items} itens
                      {checklist.isTemplate && (
                        <Badge variant="secondary" className="ml-2">Template</Badge>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:block text-sm">
                    {checklist.createdBy}
                  </div>
                  <div className="hidden md:block text-sm">
                    {new Date(checklist.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
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
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {filteredChecklists.length === 0 && (
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
    </div>
  );
}
