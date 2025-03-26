
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";
import { useUsers } from "@/hooks/useUsers";
import { useChecklists } from "@/hooks/useChecklists";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, CalendarIcon, X, Filter, Building2, User2, ClipboardList, AlertTriangle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InspectionFilters as IInspectionFilters } from "@/types/newChecklist";

interface InspectionFiltersProps {
  filters: IInspectionFilters;
  setFilters: (filters: IInspectionFilters) => void;
}

export function InspectionFilters({ filters, setFilters }: InspectionFiltersProps) {
  const { companies } = useCompanies();
  const { users } = useUsers();
  const { checklists } = useChecklists();
  const [showDateRange, setShowDateRange] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      companyId: "all",
      responsibleId: "all",
      checklistId: "all",
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.companyId !== "all" ||
      filters.responsibleId !== "all" ||
      filters.checklistId !== "all" ||
      filters.startDate !== undefined ||
      filters.endDate !== undefined
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, empresa ou responsável..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1.5 h-6 w-6 p-0"
                onClick={() => setFilters({ ...filters, search: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              className="flex-shrink-0"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters() && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-primary-foreground" />
              )}
            </Button>
            
            <Popover open={showDateRange} onOpenChange={setShowDateRange}>
              <PopoverTrigger asChild>
                <Button
                  variant={filters.startDate ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    filters.endDate ? (
                      <>
                        {format(filters.startDate, "dd/MM/yyyy")} -&nbsp;
                        {format(filters.endDate, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(filters.startDate, "dd/MM/yyyy")
                    )
                  ) : (
                    "Período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={ptBR}
                  mode="range"
                  selected={{
                    from: filters.startDate || undefined,
                    to: filters.endDate || undefined
                  }}
                  onSelect={(range) => {
                    setFilters({
                      ...filters,
                      startDate: range?.from,
                      endDate: range?.to
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
            
            {(hasActiveFilters() || filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex-shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-md bg-muted/20">
            <div className="space-y-2">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Empresa</span>
              </div>
              <Select
                value={filters.companyId}
                onValueChange={(value) =>
                  setFilters({ ...filters, companyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name || "Empresa sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Responsável</span>
              </div>
              <Select
                value={filters.responsibleId}
                onValueChange={(value) =>
                  setFilters({ ...filters, responsibleId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos responsáveis</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Checklist</span>
              </div>
              <Select
                value={filters.checklistId}
                onValueChange={(value) =>
                  setFilters({ ...filters, checklistId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos checklists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos checklists</SelectItem>
                  {checklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      {checklist.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Prioridade</span>
              </div>
              <Select
                value={filters.priority}
                onValueChange={(value: "all" | "low" | "medium" | "high") =>
                  setFilters({ ...filters, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value: "all" | "pending" | "in_progress" | "completed") =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
