
import React from "react";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onAddMedia?: () => void;
}

export const ResponseInputRenderer: React.FC<ResponseInputRendererProps> = ({
  question,
  response,
  onResponseChange,
  onAddMedia
}) => {
  // Determine response type
  const responseType = question.responseType || question.tipo_resposta || "text";
  
  // Handle yes/no responses
  if (responseType === 'yes_no') {
    return (
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'sim' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100'
          }`}
          onClick={() => onResponseChange('sim')}
        >
          Sim
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'não' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100'
          }`}
          onClick={() => onResponseChange('não')}
        >
          Não
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${
            response?.value === 'n/a' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-100'
          }`}
          onClick={() => onResponseChange('n/a')}
        >
          N/A
        </button>
      </div>
    );
  }
  
  // Default to text input for all other types
  return (
    <textarea
      className="w-full border rounded p-2 text-sm"
      rows={3}
      placeholder="Digite sua resposta..."
      value={response?.value || ''}
      onChange={(e) => onResponseChange(e.target.value)}
    />
  );
};
