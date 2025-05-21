import React from "react";
export const TimeInput = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
  <input
    type="time"
    value={value}
    onChange={e => onChange(e.target.value)}
    className="form-control"
  />
);
