
import { Checklist } from "@/types/checklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChecklistPermissions } from "@/hooks/checklist/useChecklistPermissions";

// Expanded category options
const CATEGORIES = [
  { value: "safety", label: "Segurança" },
  { value: "quality", label: "Qualidade" },
  { value: "maintenance", label: "Manutenção" },
  { value: "environment", label: "Meio Ambiente" },
  { value: "operational", label: "Operacional" },
  { value: "compliance", label: "Conformidade" },
  { value: "training", label: "Treinamento" },
  { value: "risk", label: "Gestão de Riscos" },
  { value: "general", label: "Geral" }
];

interface ChecklistFormProps {
  checklist: Checklist;
  users: any[];
  setChecklist: React.Dispatch<React.SetStateAction<Checklist | null>>;
  isNewChecklist?: boolean;
}

export default function ChecklistForm({ checklist, users, setChecklist, isNewChecklist = false }: ChecklistFormProps) {
  const { data: permissions } = useChecklistPermissions(checklist.id);
  const canEdit = isNewChecklist || permissions?.write || false;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNewChecklist ? "Criar Novo Checklist" : "Detalhes do Checklist"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={checklist.title}
            onChange={(e) => setChecklist({...checklist, title: e.target.value})}
            placeholder="Digite o título do checklist"
            disabled={!canEdit}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={checklist.category || "general"} 
              onValueChange={(value) => setChecklist({...checklist, category: value})}
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
              value={checklist.responsible_id || ""} 
              onValueChange={(value) => setChecklist({...checklist, responsible_id: value})}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem responsável</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={checklist.description || ""}
            onChange={(e) => setChecklist({...checklist, description: e.target.value})}
            placeholder="Descreva o propósito deste checklist"
            rows={3}
            disabled={!canEdit}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="template"
            checked={checklist.is_template}
            onCheckedChange={(checked) => setChecklist({...checklist, is_template: checked})}
            disabled={!canEdit}
          />
          <Label htmlFor="template">Template</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={checklist.status_checklist === "ativo"}
            onCheckedChange={(checked) => 
              setChecklist({
                ...checklist, 
                status_checklist: checked ? "ativo" : "inativo"
              })
            }
            disabled={!canEdit}
          />
          <Label htmlFor="status">
            {checklist.status_checklist === "ativo" ? "Ativo" : "Inativo"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
