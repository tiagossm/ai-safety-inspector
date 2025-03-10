
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "./FormSection";
import { NewChecklist } from "@/types/checklist";
import { Card, CardContent } from "@/components/ui/card";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

interface ImportCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  file,
  onFileChange
}: ImportCreateFormProps) {
  const { getTemplateFileUrl } = useChecklistImport();
  
  const downloadTemplateFile = () => {
    const templateUrl = getTemplateFileUrl();
    window.open(templateUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <FormSection title="Informações Básicas">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title-import">Título *</Label>
            <Input
              id="title-import"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nome da lista de verificação"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category-import">Categoria</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="responsible-import">Responsável</Label>
            <Select 
              value={form.responsible_id || ""} 
              onValueChange={(value) => setForm({ ...form, responsible_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due-date-import">Data de vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date-import"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.due_date ? (
                    format(new Date(form.due_date), "PPP", { locale: ptBR })
                  ) : (
                    "Escolha uma data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.due_date ? new Date(form.due_date) : undefined}
                  onSelect={(date) => 
                    setForm({ ...form, due_date: date ? date.toISOString() : null })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template-import"
            checked={form.is_template}
            onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
          />
          <Label htmlFor="template-import">
            Salvar como template
          </Label>
        </div>
      </FormSection>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid gap-4">
            <Label htmlFor="file-upload">Upload de Arquivo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste e solte seu arquivo CSV ou XLSX aqui, ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mb-4">
                (Tamanho máximo: 5MB)
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Selecionar Arquivo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplateFile}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Modelo
                </Button>
              </div>
              {file && (
                <p className="mt-4 text-sm font-medium text-green-600">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>O arquivo deve seguir o formato padrão com as colunas:</p>
              <ul className="list-disc pl-5 mt-1">
                <li><strong>Pergunta</strong> (obrigatório)</li>
                <li><strong>Tipo de Resposta</strong> (obrigatório)</li>
                <li><strong>Obrigatório</strong> (sim/não)</li>
                <li><strong>Ordem</strong></li>
                <li><strong>Opções</strong> (separadas por vírgula)</li>
                <li><strong>Permite Áudio</strong> (sim/não)</li>
                <li><strong>Permite Vídeo</strong> (sim/não)</li>
                <li><strong>Permite Foto</strong> (sim/não)</li>
              </ul>
              <p className="mt-2 text-blue-600">
                <strong>Tipos de resposta aceitos:</strong> Texto, Numérico, Múltipla Escolha, Data, Sim/Não
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
