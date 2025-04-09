import React, { useState } from "react";
import { NewChecklistPayload } from "@/types/newChecklist";

// Fix for NewChecklistPayload to NewChecklist conversion
const [checklist, setChecklist] = useState<NewChecklistPayload>({
  title: "",
  description: "",
  is_template: false,  // Changed from isTemplate to is_template
  status: "active",
  category: ""
});

// Convert to a default export
export default function NewChecklistCreate() {
  return (
    <div>New Checklist Create Component</div>
  );
}
