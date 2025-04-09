
// Update references to is_sub_checklist to match interface
const checklist = {
  id: id,
  title: data.title || "",
  description: data.description || "",
  isTemplate: data.is_template || false,
  status: data.status || "active",
  category: data.category || "",
  responsibleId: data.responsible_id || "",
  companyId: data.company_id || "",
  userId: data.user_id || "",
  createdAt: data.created_at || "",
  updatedAt: data.updated_at || "",
  dueDate: data.due_date || "",
  isSubChecklist: data.is_sub_checklist || false,  // Changed from is_sub_checklist to isSubChecklist
  origin: data.origin || "manual",
  totalQuestions,
  completedQuestions: 0,
  companyName: data.company?.fantasy_name || "",
  responsibleName: data.responsible?.name || "",
  questions: questions || [],
  groups: groups || []
};
