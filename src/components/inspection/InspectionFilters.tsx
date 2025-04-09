
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X, Filter, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { InspectionFilters } from "@/types/newChecklist";

interface InspectionFiltersProps {
  filters: InspectionFilters;
  onFilterChange: (filters: InspectionFilters) => void;
  companies: { id: string; name: string }[];
  responsibles: { id: string; name: string }[];
  checklists: { id: string; title: string }[];
  loading?: boolean;
  onClearFilters?: () => void;
}

interface DateRangeExtended {
  from: Date | undefined;
  to: Date | undefined;
}

export function InspectionFiltersComponent({
  filters,
  onFilterChange,
  companies,
  responsibles,
  checklists,
  loading,
  onClearFilters
}: InspectionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRangeExtended | undefined>(
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate)
        }
      : undefined
  );

  const handleDateRangeChange = (range: DateRangeExtended | undefined) => {
    setLocalDateRange(range);
    if (range?.from) {
      onFilterChange({
        ...filters,
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: range.to ? format(range.to, "yyyy-MM-dd") : format(range.from, "yyyy-MM-dd")
      });
    } else {
      onFilterChange({
        ...filters,
        startDate: undefined,
        endDate: undefined
      });
    }
  };

  const handleCompanyChange = (companyId: string) => {
    onFilterChange({ ...filters, companyId });
  };

  const handleResponsibleChange = (responsibleId: string) => {
    onFilterChange({ ...filters, responsibleId });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: string) => {
    onFilterChange({ ...filters, priority });
  };

  const handleChecklistChange = (checklistId: string) => {
    onFilterChange({ ...filters, checklistId });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearAllFilters = () => {
    setLocalDateRange(undefined);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = (): boolean => {
    return (
      filters.search !== "" ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.companyId !== "all" ||
      filters.responsibleId !== "all" ||
      filters.checklistId !== "all" ||
      !!filters.startDate
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar inspeções por título, empresa..."
            className="pl-10"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  localDateRange && "text-primary"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localDateRange?.from ? (
                  localDateRange.to ? (
                    <>
                      {format(localDateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(localDateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(localDateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={localDateRange?.from}
                selected={{
                  from: localDateRange?.from,
                  to: localDateRange?.to
                }}
                onSelect={(range) => handleDateRangeChange(range as DateRangeExtended)}
                numberOfMonths={2}
              />
              <div className="flex items-center justify-end gap-2 p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange(undefined)}
                >
                  Limpar
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => document.body.click()} // Close the popover
                >
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className={cn(hasActiveFilters() && "border-primary text-primary")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters() && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </Button>

          {hasActiveFilters() && (
            <Button variant="ghost" size="icon" onClick={clearAllFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={handleStatusChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select
                value={filters.priority}
                onValueChange={handlePriorityChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Select
                value={filters.companyId}
                onValueChange={handleCompanyChange}
                disabled={loading || companies.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsável</label>
              <Select
                value={filters.responsibleId}
                onValueChange={handleResponsibleChange}
                disabled={loading || responsibles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {responsibles.map((responsible) => (
                    <SelectItem key={responsible.id} value={responsible.id}>
                      {responsible.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Checklist</label>
              <Select
                value={filters.checklistId}
                onValueChange={handleChecklistChange}
                disabled={loading || checklists.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os checklists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {checklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id}>
                      {checklist.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export const InspectionFilters = InspectionFiltersComponent;
