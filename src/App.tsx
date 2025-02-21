
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/ui/ThemeContext";
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

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:companyId/units/new" element={<AddUnit />} />
              <Route path="/inspecoes" element={<Companies />} /> {/* Temporário até criarmos a página de inspeções */}
              <Route path="/users" element={<Users />} />
              <Route path="/configuracoes" element={<Companies />} /> {/* Temporário até criarmos a página de configurações */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
