
// Fix for NewChecklistPayload to NewChecklist conversion
const [checklist, setChecklist] = useState<NewChecklistPayload>({
  title: "",
  description: "",
  is_template: false,  // Changed from isTemplate to is_template
  status: "active",
  category: ""
});
