
import React from 'react';

export interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}

export function TextInput({
  value = '',
  onChange,
  multiline = false,
  placeholder = "Digite sua resposta...",
  readOnly = false
}: TextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  if (multiline) {
    return (
      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={readOnly}
      />
    );
  }

  return (
    <input
      type="text"
      className="w-full border rounded p-2 text-sm"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={readOnly}
    />
  );
}
