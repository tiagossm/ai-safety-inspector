
import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";

const ChecklistEditorPage = lazy(() => import("@/pages/ChecklistEditorPage"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const ChecklistDetails = lazy(() => import("@/pages/ChecklistDetails"));
const CreateChecklist = lazy(() => import("@/pages/CreateChecklist"));

import NewChecklists from "./NewChecklists";
import NewChecklistCreate from "./NewChecklistCreate";
import NewChecklistEdit from "./NewChecklistEdit";
import NewChecklistDetails from "./NewChecklistDetails";
import NewInspectionPage from "./NewInspectionPage";
import InspectionExecutionPage from "./InspectionExecutionPage";

// Export an array of route elements instead of a component
export const checklistRoutes = [
  // Original checklist routes
  <Route key="checklists" path="/checklists" element={<RequireAuth><Checklists /></RequireAuth>} />,
  <Route key="checklist-details" path="/checklists/:id" element={<RequireAuth><ChecklistDetails /></RequireAuth>} />,
  <Route key="checklist-editor" path="/checklists/editor" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="checklist-editor-id" path="/checklists/editor/:id" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="create-checklist" path="/create-checklist" element={<RequireAuth><CreateChecklist /></RequireAuth>} />,
  
  // New checklist routes with auth protection
  <Route key="new-checklists" path="/new-checklists" element={<RequireAuth><NewChecklists /></RequireAuth>} />,
  <Route key="new-checklists-create" path="/new-checklists/create" element={<RequireAuth><NewChecklistCreate /></RequireAuth>} />,
  <Route key="new-checklists-edit" path="/new-checklists/edit/:id" element={<RequireAuth><NewChecklistEdit /></RequireAuth>} />,
  <Route key="new-checklists-id" path="/new-checklists/:id" element={<RequireAuth><NewChecklistDetails /></RequireAuth>} />,
  <Route key="inspections-new" path="/inspections/new/:id" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />,
  <Route key="inspections-id" path="/inspections/:id" element={<RequireAuth><InspectionExecutionPage /></RequireAuth>} />,
  <Route key="inspections-view" path="/inspections/:id/view" element={<RequireAuth><InspectionExecutionPage /></RequireAuth>} />
];
