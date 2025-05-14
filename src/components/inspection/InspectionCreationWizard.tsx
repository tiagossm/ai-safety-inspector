
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChecklistWithStats } from "@/types/newChecklist";
import { ChecklistGrid } from "@/components/new-checklist/ChecklistGrid";
import { useNewChecklists } from "@/hooks/new-checklist/useNewChecklists";
import { ChecklistFilters } from "@/components/new-checklist/ChecklistFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckSquare, Grid, List } from "lucide-react";

export function InspectionCreationWizard() {
  const navigate = useNavigate();
  const {
    checklists,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCategory,
    setSelectedCategory,
    selectedOrigin,
    setSelectedOrigin,
    sortOrder,
    setSortOrder,
    companies,
    categories,
  } = useNewChecklists();

  // We only want to display active checklists for inspections
  const activeChecklists = checklists.filter(
    (checklist) => checklist.status === "active"
  );

  const handleSelectChecklist = (id: string) => {
    navigate(`/inspections/new/${id}`);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Inspeção</h1>
          <p className="text-muted-foreground">
            Selecione um checklist para iniciar sua inspeção
          </p>
        </div>
      </div>

      <ChecklistFilters
        search={searchTerm}
        setSearch={setSearchTerm}
        sortColumn={sortOrder.split('_')[0]}
        setSortColumn={(col) => setSortOrder(`${col}_${sortOrder.split('_')[1]}`)}
        sort={sortOrder.split('_')[1] as 'asc' | 'desc'}
        setSort={(dir) => setSortOrder(`${sortOrder.split('_')[0]}_${dir}`)}
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        companies={companies}
        categories={categories}
        filterType={filterType}
        setFilterType={setFilterType}
        selectedChecklists={[]}
        minimal={true}
      />

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              <span>Cartões</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Lista</span>
            </TabsTrigger>
          </TabsList>
          
          <p className="text-sm text-muted-foreground">
            {activeChecklists.length} {activeChecklists.length === 1 ? 'checklist' : 'checklists'} disponíveis
          </p>
        </div>

        <TabsContent value="grid" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChecklists.map((checklist) => (
              <ChecklistSelectionCard
                key={checklist.id}
                checklist={checklist}
                onSelect={handleSelectChecklist}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <ChecklistGrid
            checklists={activeChecklists}
            isLoading={isLoading}
            onEdit={() => {}}
            onDelete={() => {}}
            onOpen={handleSelectChecklist}
            onStatusChange={() => {}}
            selectionMode={true}
            onSelect={handleSelectChecklist}
          />
        </TabsContent>
      </Tabs>

      {activeChecklists.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
          <CheckSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum checklist disponível</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Não há checklists ativos para iniciar uma inspeção. 
            Você precisará criar um checklist primeiro.
          </p>
          <Button onClick={() => navigate("/new-checklists/create")}>
            Criar Checklist
          </Button>
        </div>
      )}
    </div>
  );
}

interface ChecklistSelectionCardProps {
  checklist: ChecklistWithStats;
  onSelect: (id: string) => void;
}

function ChecklistSelectionCard({ checklist, onSelect }: ChecklistSelectionCardProps) {
  return (
    <div 
      className="border rounded-md p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md"
      onClick={() => onSelect(checklist.id)}
    >
      <div className="space-y-2">
        <h3 className="font-medium line-clamp-1">{checklist.title}</h3>
        {checklist.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {checklist.description}
          </p>
        )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{checklist.totalQuestions || 0} perguntas</span>
          <span>{checklist.category || "Sem categoria"}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" className="gap-2">
          <CheckSquare className="h-4 w-4" />
          Selecionar
        </Button>
      </div>
    </div>
  );
}
