
import React from "react";

/**
 * Exibe um resumo compacto do plano de ação 5W2H.
 */
interface ActionPlanInlineSummaryProps {
  actionPlan: any;
}

export function ActionPlanInlineSummary({ actionPlan }: ActionPlanInlineSummaryProps) {
  if (!actionPlan) return null;
  const plan = {
    what: actionPlan.what ?? actionPlan["o_que"],
    why: actionPlan.why ?? actionPlan["por_que"],
    who: actionPlan.who ?? actionPlan["quem"],
    where: actionPlan.where ?? actionPlan["onde"],
    when: actionPlan.when ?? actionPlan["quando"],
    how: actionPlan.how ?? actionPlan["como"],
    howMuch: actionPlan.howMuch ?? actionPlan["quanto"],
    ...actionPlan
  };
  const shownKeys = ["what", "why", "who", "where", "when", "how", "howMuch","o_que","por_que","quem","onde","quando","como","quanto"];
  return (
    <div className="mt-1 border rounded bg-amber-50 border-amber-200 px-2 py-1 text-xs space-y-1 animate-fade-in">
      <span className="block font-medium text-amber-800 mb-1">Plano de Ação:</span>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {plan.what && <div><span className="font-semibold text-amber-900">O quê:</span> {plan.what}</div>}
        {plan.why && <div><span className="font-semibold text-amber-900">Por quê:</span> {plan.why}</div>}
        {plan.who && <div><span className="font-semibold text-amber-900">Quem:</span> {plan.who}</div>}
        {plan.when && <div><span className="font-semibold text-amber-900">Quando:</span> {plan.when}</div>}
        {plan.where && <div><span className="font-semibold text-amber-900">Onde:</span> {plan.where}</div>}
        {plan.how && <div><span className="font-semibold text-amber-900">Como:</span> {plan.how}</div>}
        {plan.howMuch && <div><span className="font-semibold text-amber-900">Quanto:</span> {plan.howMuch}</div>}
      </div>
      {/* Campos extras, se houver */}
      {Object.keys(plan).filter(
        k => !shownKeys.includes(k) && plan[k] !== undefined && String(plan[k]).trim() !== ""
      ).length > 0 && (
        <div className="mt-1">
          <span className="font-semibold text-amber-900">Outros:</span>{" "}
          {Object.keys(plan)
            .filter(k => !shownKeys.includes(k) && plan[k] !== undefined && String(plan[k]).trim() !== "")
            .map((k, i) => (
              <span key={k}><b>{k}:</b> {String(plan[k])}{i < Object.keys(plan).length - 1 ? ", " : ""}</span>
            ))}
        </div>
      )}
    </div>
  );
}
