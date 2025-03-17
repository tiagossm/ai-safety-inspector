
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { AuthProvider } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Companies from "@/pages/Companies";
import CompanyDetail from "@/pages/CompanyDetail";
import Employees from "@/pages/Employees";
import Checklists from "@/pages/Checklists";
import CreateChecklist from "@/pages/CreateChecklist";
import ChecklistDetail from "@/pages/ChecklistDetail";
import Settings from "@/pages/Settings";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
            <Route path="checklists" element={<Checklists />} />
            <Route path="checklists/create" element={<CreateChecklist />} />
            <Route path="checklists/:id" element={<ChecklistDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
