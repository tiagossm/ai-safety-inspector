
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, FileUp, FileDown, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserHeaderProps {
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
  onAddUser: () => void;
}

export function UserHeader({
  showInactive,
  setShowInactive,
  search,
  setSearch,
  onAddUser
}: UserHeaderProps) {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setImporting(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-user-csv`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Importação concluída",
        description: `${result.processed} usuários importados.${result.errors.length ? ` ${result.errors.length} erros encontrados.` : ''}`
      });

    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('name, email, role, phone')
        .csv();

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([users], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => document.getElementById('csv-import')?.click()}
            disabled={importing}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <input
            id="csv-import"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button
            variant="outline"
            onClick={handleExportCSV}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={onAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-inactive">Mostrar inativos</Label>
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
        </div>
      </div>
    </div>
  );
}
