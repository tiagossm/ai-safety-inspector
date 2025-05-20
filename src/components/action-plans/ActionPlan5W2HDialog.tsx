import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ActionPlan5W2HDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  iaSuggestions?: Partial<{
    where: string;
    how: string;
    howMuch: string;
  }>;
  existingPlan?: any;
}

export function ActionPlan5W2HDialog({
  open,
  onOpenChange,
  onSave,
  iaSuggestions = {},
  existingPlan = {}
}: ActionPlan5W2HDialogProps) {
  // Campos 5W2H
  const [what, setWhat] = useState(existingPlan.what || "");
  const [why, setWhy] = useState(existingPlan.why || "");
  const [who, setWho] = useState(existingPlan.who || "");
  const [when, setWhen] = useState(existingPlan.when || "");
  const [where, setWhere] = useState(existingPlan.where || iaSuggestions.where || "");
  const [how, setHow] = useState(existingPlan.how || iaSuggestions.how || "");
  const [howMuch, setHowMuch] = useState(existingPlan.howMuch || "");

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({
      what,
      why,
      who,
      when,
      where,
      how,
      howMuch
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Plano de Ação (5W2H)</DialogTitle>
        <div className="space-y-3">
          <div>
            <label className="font-medium">O quê? (What)</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Descreva a ação"
              value={what}
              onChange={e => setWhat(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Por quê? (Why)</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Justificativa da ação"
              value={why}
              onChange={e => setWhy(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Quem? (Who) <span className="text-xs text-gray-400">(opcional)</span></label>
            <input
              className="w-full border rounded p-2"
              placeholder="Responsável"
              value={who}
              onChange={e => setWho(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Quando? (When) <span className="text-xs text-gray-400">(opcional)</span></label>
            <input
              className="w-full border rounded p-2"
              type="date"
              value={when}
              onChange={e => setWhen(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">
              Onde? (Where) <span className="text-xs text-gray-400">(opcional, pode ser sugerido pela IA)</span>
            </label>
            <input
              className="w-full border rounded p-2"
              placeholder="Local de execução"
              value={where}
              onChange={e => setWhere(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">
              Como? (How) <span className="text-xs text-gray-400">(opcional, pode ser sugerido pela IA)</span>
            </label>
            <input
              className="w-full border rounded p-2"
              placeholder="Descrição do método"
              value={how}
              onChange={e => setHow(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">
              Quanto custa? (How much) <span className="text-xs text-gray-400">(opcional, em R$)</span>
            </label>
            <input
              className="w-full border rounded p-2"
              placeholder="R$"
              value={howMuch}
              onChange={e => setHowMuch(e.target.value)}
              type="text"
              inputMode="decimal"
              pattern="[0-9.,]*"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
