
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputSearch } from "@/components/ui/InputSearch";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChecklistsFilterCardProps {
  search: string;
  setSearch: (search: string) => void;
  selectedChecklists: string[];
  isBatchUpdating: boolean;
  onBatchUpdateStatus: (status: "active" | "inactive") => void;
}

export function ChecklistsFilterCard({
  search,
  setSearch,
  selectedChecklists,
  isBatchUpdating,
  onBatchUpdateStatus,
}: ChecklistsFilterCardProps) {
  return (
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
            onChange={(e) => setSearch(e)}
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
                  onClick={() => onBatchUpdateStatus("active")}
                  disabled={isBatchUpdating}
                >
                  Ativar selecionados
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onBatchUpdateStatus("inactive")}
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
  );
}
