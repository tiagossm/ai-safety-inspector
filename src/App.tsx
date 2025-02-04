import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Plans from "./pages/Plans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/plans" element={
              <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Plans />
                </main>
              </>
            } />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Home />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Companies />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="/blog" element={
              <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Blog />
                </main>
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  <Contact />
                </main>
              </>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;