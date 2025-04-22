
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
import SimpleInspectionPage from "@/pages/SimpleInspectionPage";
import StartInspectionPage from "@/pages/StartInspectionPage";
import Inspections from "@/pages/Inspections";
import { Users } from "@/pages/Users";
import ChecklistRedirectPage from "@/pages/ChecklistRedirectPage";
import InspectionExecutionPage from "@/pages/InspectionExecutionPage";

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
            
            {/* Checklist routes */}
            <Route path="new-checklists" element={<NewChecklists />} />
            <Route path="new-checklists/create" element={<NewChecklistCreate />} />
            <Route path="new-checklists/edit/:id" element={<NewChecklistEdit />} />
            <Route path="new-checklists/:id/edit" element={<NewChecklistEdit />} />
            <Route path="new-checklists/:id" element={<NewChecklistDetails />} />
            
            {/* Inspection routes - Order matters for correct matching! */}
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspections/redirect/:id" element={<ChecklistRedirectPage />} />
            {/* Substituímos a rota antiga pela nova tela de iniciar inspeções */}
            <Route path="inspections/start/:checklistId" element={<StartInspectionPage />} />
            <Route path="inspections/start" element={<StartInspectionPage />} />
            <Route path="inspections/new/:id" element={<NewInspectionPage />} />
            <Route path="inspections/new" element={<NewInspectionPage />} />
            <Route path="inspections/:id/view" element={<InspectionExecutionPage />} />
            <Route path="inspections/:id" element={<SimpleInspectionPage />} />
            
            {/* Redirect old routes to new ones */}
            <Route path="checklists" element={<Navigate to="/new-checklists" replace />} />
            <Route path="checklists/create" element={<Navigate to="/new-checklists/create" replace />} />
            <Route path="checklists/:id" element={<Navigate to="/new-checklists/:id" replace />} />
            
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
