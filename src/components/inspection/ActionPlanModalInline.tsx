
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ActionPlanModalInlineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionPlan: any;
}

export function ActionPlanModalInline({ open, onOpenChange, actionPlan }: ActionPlanModalInlineProps) {
  if (!actionPlan) return null;
  // name mapping, fallback engl/ptbr keys for legacy
  const plan = {
    what: actionPlan.what ?? actionPlan["o_que"],
    why: actionPlan.why ?? actionPlan["por_que"],
    who: actionPlan.who ?? actionPlan["quem"],
    where: actionPlan.where ?? actionPlan["onde"],
    when: actionPlan.when ?? actionPlan["quando"],
    how: actionPlan.how ?? actionPlan["como"],
    howMuch: actionPlan.howMuch ?? actionPlan["quanto"],
    // fallback
    ...actionPlan
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plano de Ação (5W2H)</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          {plan.what && <p><strong>O quê:</strong> {plan.what}</p>}
          {plan.why && <p><strong>Por que:</strong> {plan.why}</p>}
          {plan.who && <p><strong>Quem:</strong> {plan.who}</p>}
          {plan.when && <p><strong>Quando:</strong> {plan.when}</p>}
          {plan.where && <p><strong>Onde:</strong> {plan.where}</p>}
          {plan.how && <p><strong>Como:</strong> {plan.how}</p>}
          {plan.howMuch && <p><strong>Quanto:</strong> {plan.howMuch}</p>}
          {/* Outros campos extras fallback */}
          {Object.keys(plan).filter(k => !["what","why","who","where","when","how","howMuch","o_que","por_que","quem","onde","quando","como","quanto"].includes(k)).map(k => (
            <div key={k}><strong>{k}:</strong> {String(plan[k])}</div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
