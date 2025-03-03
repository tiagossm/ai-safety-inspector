
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewChecklist } from "@/types/checklist";

// Checklist category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "general", label: "Geral" }
];

interface ManualCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  canEdit?: boolean;
}

export function ManualCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  canEdit = true
}: ManualCreateFormProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título do Checklist *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ex: Checklist NR-12 para Máquinas"
          required
          disabled={!canEdit}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="category">Categoria</Label>
        <Select 
          value={form.category} 
          onValueChange={(value) => setForm({ ...form, category: value })}
          disabled={!canEdit}
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
      
      <div className="grid gap-2">
        <Label htmlFor="responsible">Responsável</Label>
        <Select 
          value={form.responsible_id || ""} 
          onValueChange={(value) => setForm({ ...form, responsible_id: value })}
          disabled={!canEdit}
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
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descreva a finalidade deste checklist..."
          rows={3}
          disabled={!canEdit}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="template"
          checked={form.is_template}
          onCheckedChange={(checked) => setForm({ ...form, is_template: checked })}
          disabled={!canEdit}
        />
        <Label htmlFor="template">
          Salvar como template
        </Label>
      </div>
    </div>
  );
}
