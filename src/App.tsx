
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ui/ThemeContext";
import SessionChecker from "./components/SessionChecker";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import Companies from "./pages/Companies";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import { Users } from "./pages/Users";
import NotFound from "./pages/NotFound";
import AddUnit from "./pages/AddUnit";
import Inspections from "./pages/Inspections";
import Checklists from "./pages/Checklists";
import CreateChecklist from "./pages/CreateChecklist";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import BillingPage from "./pages/BillingPage";
import Reports from "./pages/Reports";
import Incidents from "./pages/Incidents";
import AdminDashboard from "./pages/AdminDashboard";
import ChecklistDetails from "./pages/ChecklistDetails";
import { OfflineStatus } from "./components/ui/OfflineStatus";
import IdleTimeoutManager from "@/components/IdleTimeoutManager";
import { Toaster as SonnerToaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      networkMode: 'always',
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      }
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SessionChecker>
              <IdleTimeoutManager timeout={60}>
                <SonnerToaster richColors position="top-right" />
                <Toaster />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Route>
                  
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/:companyId/units/new" element={<AddUnit />} />
                    <Route path="/inspections" element={<Inspections />} />
                    <Route path="/checklists" element={<Checklists />} />
                    <Route path="/checklists/create" element={<CreateChecklist />} />
                    <Route path="/checklists/:id" element={<ChecklistDetails />} />
                    <Route path="/incidents" element={<Incidents />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/permissions" element={<Settings />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </IdleTimeoutManager>
            </SessionChecker>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
