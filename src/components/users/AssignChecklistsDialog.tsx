
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Checklist {
  id: string;
  title: string;
  company_id: string;
}

interface AssignChecklistsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  selectedCompanies: string[];
  selectedChecklists: string[];
  onChecklistsChange: (checklists: string[]) => void;
}

export function AssignChecklistsDialog({
  open,
  onOpenChange,
  userId,
  selectedCompanies,
  selectedChecklists,
  onChecklistsChange,
}: AssignChecklistsDialogProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && selectedCompanies.length > 0) {
      loadChecklists();
    }
  }, [open, selectedCompanies]);

  const loadChecklists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("checklists")
      .select("id, title, company_id")
      .in("company_id", selectedCompanies)
      .eq("status", "active")
      .order("title");

    if (!error && data) {
      setChecklists(data);
    }
    setLoading(false);
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedCompanies.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Checklists</DialogTitle>
            <DialogDescription>
              Primeiro, atribua empresas ao usuário para poder selecionar os checklists.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Checklists</DialogTitle>
          <DialogDescription>
            Selecione os checklists que este usuário poderá acessar
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar checklists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center p-4">Carregando...</div>
          ) : filteredChecklists.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Nenhum checklist encontrado
            </div>
          ) : (
            filteredChecklists.map((checklist) => (
              <div key={checklist.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                <Checkbox
                  id={checklist.id}
                  checked={selectedChecklists.includes(checklist.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChecklistsChange([...selectedChecklists, checklist.id]);
                    } else {
                      onChecklistsChange(selectedChecklists.filter(id => id !== checklist.id));
                    }
                  }}
                />
                <label
                  htmlFor={checklist.id}
                  className="flex-grow cursor-pointer text-sm"
                >
                  {checklist.title}
                </label>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
