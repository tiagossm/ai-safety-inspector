import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { FilterX, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CompanySelector } from "./CompanySelector";
import { InspectionFilters as InspectionFiltersType } from "@/types/newChecklist";

export interface InspectionFiltersProps {
  filters: InspectionFilters;
  setFilters: (filters: InspectionFilters) => void;
}

export function InspectionFilters({ 
  filters, 
  setFilters 
}: InspectionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<InspectionFiltersType>(filters);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: filters.startDate,
    to: filters.endDate
  });

  // Function to apply filters and close dialog
  const applyFilters = () => {
    // Convert date range to filters
    const updatedFilters = {
      ...tempFilters,
      startDate: dateRange.from,
      endDate: dateRange.to
    };
    setFilters(updatedFilters);
    setIsOpen(false);
  };

  // Function to clear all filters
  const clearFilters = () => {
    const clearedFilters: InspectionFiltersType = {
      search: "",
      status: "",
      priority: "",
      companyId: "",
      responsibleId: "",
      checklistId: "",
      startDate: undefined,
      endDate: undefined
    };
    setTempFilters(clearedFilters);
    setDateRange({ from: undefined, to: undefined });
  };

  // Handle dialog open state
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When opening, copy current filters to temp
      setTempFilters(filters);
      setDateRange({
        from: filters.startDate,
        to: filters.endDate
      });
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex gap-2 items-center">
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <span>Filtros</span>
            {Object.values(filters).some(val => val !== "" && val !== undefined) && (
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                {Object.values(filters).filter(val => val !== "" && val !== undefined).length}
              </span>
            )}
          </Button>
        </DialogTrigger>

        {Object.values(filters).some(val => val !== "" && val !== undefined) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            onClick={() => {
              setFilters({
                search: "",
                status: "",
                priority: "",
                companyId: "",
                responsibleId: "",
                checklistId: "",
                startDate: undefined,
                endDate: undefined
              });
            }}
          >
            <FilterX className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filtrar Inspeções</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status filter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={tempFilters.status}
                onValueChange={(value) => setTempFilters({...tempFilters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <Select 
                value={tempFilters.priority}
                onValueChange={(value) => setTempFilters({...tempFilters, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date range filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "PPP", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to
                    }}
                    onSelect={(range) => {
                      if (range) {
                        setDateRange({
                          from: range.from,
                          to: range.to
                        });
                      }
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Company filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa</label>
            <CompanySelector 
              value={tempFilters.companyId}
              onSelect={(value) => setTempFilters({...tempFilters, companyId: value})}
            />
          </div>

          {/* Other filters can be added here */}
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              type="button"
            >
              Limpar Filtros
            </Button>
            <Button 
              onClick={applyFilters}
              type="button"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
