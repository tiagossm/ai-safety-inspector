
import React from "react";

export const TimeInput = ({
  value,
  onChange,
}: { 
  value: string | { value: string }, 
  onChange: (v: string) => void 
}) => {
  // Extrai valor de string ou objeto de maneira segura
  const timeValue = React.useMemo(() => {
    if (typeof value === "string") {
      return value;
    } else if (value && typeof value === "object" && "value" in value) {
      return typeof value.value === "string" ? value.value : "";
    }
    return "";
  }, [value]);

  return (
    <input
      type="time"
      value={timeValue}
      onChange={e => onChange(e.target.value)}
      className="form-control"
    />
  );
};
