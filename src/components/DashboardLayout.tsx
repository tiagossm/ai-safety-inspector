import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Classes dinâmicas
  const mainMargin = sidebarOpen ? 'ml-64' : 'ml-20';
  const headerLeft = sidebarOpen ? 'left-64' : 'left-20';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Fixa */}
      <aside className={`fixed left-0 top-0 h-screen z-50 w-64 bg-gray-800 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-6 p-2 rounded-full bg-emerald-700 hover:bg-emerald-600"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>

          <nav className="space-y-2">
            {[
              { icon: <Building />, name: "Empresas", path: "/empresas" },
              { icon: <ClipboardList />, name: "Inspeções", path: "/inspecoes" },
              { icon: <Settings />, name: "Configurações", path: "/configuracoes" },
              { icon: <LogOut />, name: "Sair", path: "/logout" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-300 ${mainMargin}`}>
        {/* Navbar Fixa */}
        <header className={`fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-8 bg-gray-900 border-b border-gray-700 ${headerLeft}`}>
          <nav className="flex space-x-8">
            {['pagina-inicial', 'dashboard', 'relatorios'].map((path) => (
              <Link
                key={path}
                to={`/${path}`}
                className="hover:text-emerald-400 transition-colors"
              >
                {path.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="relative w-48">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button className="p-2 hover:bg-gray-700 rounded-full">
              <Bell className="h-6 w-6 text-gray-400" />
            </button>

            <button className="p-2 hover:bg-gray-700 rounded-full">
              <User className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main className="pt-24 px-8 min-h-screen">
          {/* Conteúdo Dinâmico */}
          <div className="max-w-7xl mx-auto">
            {location.pathname === "/empresas" && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Empresas Cadastradas</h1>
                <div className="relative w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar empresas..."
                    className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
            
            {/* Renderização das Sub-Rotas */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}