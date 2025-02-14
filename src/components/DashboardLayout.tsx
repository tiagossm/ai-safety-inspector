import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children?: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");

  // Sincroniza a navegação ativa com a URL
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    setActiveNav(path.charAt(0).toUpperCase() + path.slice(1));
  }, [location]);

  const mainBgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  // Itens da Sidebar com rotas
  const sidebarItems = [
    { icon: <Building />, name: "Empresas", path: "/empresas" },
    { icon: <ClipboardList />, name: "Inspeções", path: "/inspecoes" },
    { icon: <Settings />, name: "Configurações", path: "/configuracoes" },
    { icon: <LogOut />, name: "Sair", path: "/logout" },
  ];

  return (
    <SidebarProvider>
      <div className={`min-h-screen ${mainBgColor}`}>
        <div className="flex">
          {/* Sidebar Corrigida */}
          <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
            ${sidebarOpen ? 'w-64' : 'w-20'}`}>

            <div className="flex flex-col items-center py-4 h-full">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 mb-4 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
              >
                <Menu className="h-6 w-6 text-white" />
              </button>

              <nav className="flex-1 space-y-4 w-full px-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`w-full p-3 flex items-center ${
                      sidebarOpen ? "justify-start gap-3" : "justify-center"
                    } rounded-lg hover:bg-gray-700/30 transition-colors group relative ${
                      location.pathname === item.path ? 'bg-gray-700/20' : ''
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && (
                      <span className={`text-sm ${textColor}`}>{item.name}</span>
                    )}
                    {!sidebarOpen && (
                      <span className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md
                        bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity
                        shadow-lg border border-gray-700">
                        {item.name}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            {/* Navbar Funcional */}
            <header className={`fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-8
              ${theme === 'dark' ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}
              ${sidebarOpen ? 'left-64' : 'left-20'}`}>

              <nav className="flex space-x-8">
                {['pagina-inicial', 'dashboard', 'relatorios'].map((path) => {
                  const name = path.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
                  return (
                    <Link
                      key={path}
                      to={`/${path}`}
                      className={`hover:text-emerald-400 transition-colors ${
                        activeNav === name ? 'text-emerald-400' : textColor
                      }`}
                    >
                      {name}
                    </Link>
                  );
                })}
              </nav>

              {/* ... (restante do header permanece igual) */}
            </header>

            {/* Área de Conteúdo Dinâmico */}
            <main className="pt-24 px-8">
              {location.pathname === "/empresas" && (
                <div className="mb-8">
                  <h1 className={`text-3xl font-bold mb-4 ${textColor}`}>Empresas Cadastradas</h1>
                  {/* ... (campo de busca de empresas) */}
                </div>
              )}
              
              <Outlet /> {/* Renderiza as rotas aninhadas */}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;