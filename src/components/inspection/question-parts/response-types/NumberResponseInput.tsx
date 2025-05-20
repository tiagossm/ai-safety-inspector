
import React from 'react';
import { ActionPlanButton } from '../question-components/ActionPlanButton';

interface NumberResponseInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  onSaveActionPlan?: (data: any) => Promise<void>;
  inspectionId?: string;
  question?: any;
}

export function NumberResponseInput({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  onSaveActionPlan,
  inspectionId,
  question
}: NumberResponseInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  const [isActionPlanOpen, setIsActionPlanOpen] = React.useState(false);

  const handleActionPlanClick = () => {
    setIsActionPlanOpen(!isActionPlanOpen);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <input
          type="number"
          className="border rounded-md px-3 py-2"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
        />
      </div>
      
      {/* Botão do plano de ação */}
      <div className="flex gap-2">
        <ActionPlanButton
          onActionPlanClick={handleActionPlanClick}
          readOnly={false}
        />
      </div>
    </div>
  );
}
