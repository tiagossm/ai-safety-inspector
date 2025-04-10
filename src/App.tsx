
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import Employees from "@/pages/Employees";
import Settings from "@/pages/Settings";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/NotFound";
import NewChecklists from "@/pages/NewChecklists";
import NewChecklistCreate from "@/pages/NewChecklistCreate";
import NewChecklistEdit from "@/pages/NewChecklistEdit";
import NewChecklistDetails from "@/pages/NewChecklistDetails";
import NewInspectionPage from "@/pages/NewInspectionPage";
import InspectionExecutionPage from "@/pages/InspectionExecutionPage";
import Inspections from "@/pages/Inspections";
import { Users } from "@/pages/Users";
import CreateChecklist from "@/pages/CreateChecklist";
import ChecklistDetails from "@/pages/ChecklistDetails";
import ChecklistEditorPage from "@/pages/ChecklistEditorPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="employees" element={<Employees />} />
            <Route path="users" element={<Users />} />
            
            {/* Legacy Checklist routes */}
            <Route path="checklists" element={<NewChecklists />} />
            <Route path="checklists/:id" element={<ChecklistDetails />} />
            <Route path="checklists/editor" element={<ChecklistEditorPage />} />
            <Route path="checklists/editor/:id" element={<ChecklistEditorPage />} />
            <Route path="create-checklist" element={<CreateChecklist />} />
            
            {/* New Checklist routes */}
            <Route path="new-checklists" element={<NewChecklists />} />
            <Route path="new-checklists/create" element={<NewChecklistCreate />} />
            <Route path="new-checklists/:id/edit" element={<NewChecklistEdit />} />
            <Route path="new-checklists/:id" element={<NewChecklistDetails />} />
            
            {/* Inspection routes */}
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspections/new" element={<NewInspectionPage />} />
            <Route path="inspections/new/:id" element={<NewInspectionPage />} />
            <Route path="inspections/:id" element={<InspectionExecutionPage />} />
            <Route path="inspections/:id/view" element={<InspectionExecutionPage />} />
            
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
