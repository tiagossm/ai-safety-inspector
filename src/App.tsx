
import { ThemeProvider } from "@/components/ui/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import Companies from "@/pages/Companies";
import Settings from "@/pages/Settings";
import { AuthProvider } from "@/components/ui/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </DashboardLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
