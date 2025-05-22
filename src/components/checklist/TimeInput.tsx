import React from "react";
export const TimeInput = ({
  value,
  onChange,
}: { value: string | { value: string }, onChange: (v: string) => void }) => (
  <input
    type="time"
    value={typeof value === "string" ? value : value?.value || ""}
    onChange={e => onChange(e.target.value)}
    className="form-control"
  />
);
