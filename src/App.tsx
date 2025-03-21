
import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="employees" element={<Employees />} />
            
            {/* New checklist routes - these are the active ones */}
            <Route path="new-checklists" element={<NewChecklists />} />
            <Route path="new-checklists/create" element={<NewChecklistCreate />} />
            <Route path="new-checklists/edit/:id" element={<NewChecklistEdit />} />
            <Route path="new-checklists/:id" element={<NewChecklistDetails />} />
            <Route path="inspections/new/:id" element={<NewInspectionPage />} />
            
            {/* Redirect old routes to new ones */}
            <Route path="checklists" element={<NewChecklists />} />
            <Route path="checklists/create" element={<NewChecklistCreate />} />
            <Route path="checklists/:id" element={<NewChecklistDetails />} />
            
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
