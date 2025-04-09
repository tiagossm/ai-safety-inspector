
import React, { useState } from "react";
import { NewChecklistPayload } from "@/types/newChecklist";

function NewChecklistCreate() {
  const [checklist, setChecklist] = useState<NewChecklistPayload>({
    title: "",
    description: "",
    is_template: false,
    status: "active",
    category: ""
  });

  return (
    <div>New Checklist Create Component</div>
  );
}

export default NewChecklistCreate;
