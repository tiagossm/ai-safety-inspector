
import React from 'react';

interface NumberResponseInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberResponseInput({
  value = 0,
  onChange,
  min,
  max,
  step = 1
}: NumberResponseInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  return (
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
  );
}
