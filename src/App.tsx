
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import { Companies } from "./pages/Companies";
import { Home } from "./pages/Home";
import { Plans } from "./pages/Plans";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { UserList } from "./pages/Users";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
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
            <Route path="/users" element={<UserList />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
