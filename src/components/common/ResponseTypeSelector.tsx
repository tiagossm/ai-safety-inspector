
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  StandardResponseType,
  RESPONSE_TYPE_LABELS,
  RESPONSE_TYPE_DESCRIPTIONS
} from "@/types/responseTypes";
import { 
  CheckSquare, 
  Type, 
  Hash, 
  FileText, 
  CircleDot, 
  CheckCheck, 
  ChevronDown, 
  Camera, 
  PenTool, 
  Calendar, 
  Clock, 
  CalendarClock 
} from "lucide-react";

interface ResponseTypeSelectorProps {
  value: StandardResponseType;
  onChange: (value: StandardResponseType) => void;
  showDescriptions?: boolean;
  disabled?: boolean;
  className?: string;
}

const getResponseTypeIcon = (type: StandardResponseType) => {
  const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 };
  
  switch (type) {
    case "yes_no": return <CheckSquare {...iconProps} />;
    case "text": return <Type {...iconProps} />;
    case "paragraph": return <FileText {...iconProps} />;
    case "numeric": return <Hash {...iconProps} />;
    case "multiple_choice": return <CircleDot {...iconProps} />;
    case "checkboxes": return <CheckCheck {...iconProps} />;
    case "dropdown": return <ChevronDown {...iconProps} />;
    case "photo": return <Camera {...iconProps} />;
    case "signature": return <PenTool {...iconProps} />;
    case "date": return <Calendar {...iconProps} />;
    case "time": return <Clock {...iconProps} />;
    case "datetime": return <CalendarClock {...iconProps} />;
    default: return <Type {...iconProps} />;
  }
};

export function ResponseTypeSelector({
  value,
  onChange,
  showDescriptions = false,
  disabled = false,
  className = ""
}: ResponseTypeSelectorProps) {
  const responseTypes: StandardResponseType[] = [
    "yes_no",
    "text", 
    "paragraph",
    "numeric",
    "multiple_choice",
    "checkboxes",
    "dropdown",
    "photo",
    "signature",
    "date",
    "time",
    "datetime"
  ];

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            {getResponseTypeIcon(value)}
            <span>{RESPONSE_TYPE_LABELS[value]}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border shadow-lg z-50">
        {responseTypes.map((type) => (
          <SelectItem key={type} value={type} className="cursor-pointer">
            <div className="flex items-start gap-3 py-1">
              <div className="mt-0.5">
                {getResponseTypeIcon(type)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{RESPONSE_TYPE_LABELS[type]}</span>
                {showDescriptions && (
                  <span className="text-xs text-gray-500 mt-0.5">
                    {RESPONSE_TYPE_DESCRIPTIONS[type]}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
