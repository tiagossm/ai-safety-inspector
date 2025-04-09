
import React, { useState } from "react";
import { NewChecklistPayload } from "@/types/newChecklist";

// Fix for NewChecklistPayload to NewChecklist conversion
function NewChecklistCreate() {
  const [checklist, setChecklist] = useState<NewChecklistPayload>({
    title: "",
    description: "",
    is_template: false,  // Changed from isTemplate to is_template
    status: "active",
    category: ""
  });

  return (
    <div>New Checklist Create Component</div>
  );
}

export default NewChecklistCreate;
