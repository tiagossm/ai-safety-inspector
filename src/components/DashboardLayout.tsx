import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, User, Menu, Building, ClipboardList, Settings, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");

  const mainBgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  return (
    <SidebarProvider>
      <div className={`min-h-screen ${mainBgColor}`}>
        {/* Container Principal */}
        <div className="flex">
          {/* Sidebar Minimizada */}
          <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
            ${sidebarOpen ? 'w-64' : 'w-20'}`}>

            <div className="flex flex-col items-center py-4 h-full">
              {/* Botão Hambúrguer */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 mb-4 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors"
              >
                <Menu className="h-6 w-6 text-white" />
              </button>

              {/* Ícones da Sidebar */}
              <nav className="flex-1 space-y-4 w-full px-2">
                {[
                  { icon: <Building />, name: "Empresas" },
                  { icon: <ClipboardList />, name: "Inspeções" },
                  { icon: <Settings />, name: "Configurações" },
                  { icon: <LogOut />, name: "Sair" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className="w-full p-3 flex items-center justify-center rounded-lg
                     hover:bg-gray-700/30 transition-colors group relative"
                  >
                    {item.icon}
                    {!sidebarOpen && (
                      <span className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md
                        bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.name}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            
            {/* Navbar Superior */}
            <header className={`fixed top-0 right-0 h-16 z-40 flex items-center justify-between px-8
              ${theme === 'dark' ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}
              ${sidebarOpen ? 'left-64' : 'left-20'}`}>

              <nav className="flex space-x-8">
                {['Página Inicial', 'Dashboard', 'Relatórios'].map((item) => (
                  <Link
                    key={item}
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className={`hover:text-emerald-400 transition-colors ${
                      activeNav === item ? 'text-emerald-400' : textColor
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className={`pl-4 pr-10 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <button className="p-2 hover:bg-gray-700/30 rounded-full">
                  <Bell className="h-6 w-6 text-gray-400" />
                </button>

                <button className="p-2 hover:bg-gray-700/30 rounded-full">
                  <User className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </header>

            {/* Área de Conteúdo */}
            <main className="pt-24 px-8">
              {/* Cabeçalho da Página */}
              <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-4 ${textColor}`}>Empresas Cadastradas</h1>
                
                <div className="relative w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar empresas..."
                    className={`w-full pl-4 pr-10 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Cards de Empresas */}
              <div className="grid gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className={`p-6 rounded-xl ${cardBgColor} shadow-lg`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>FAVELA HOLDING</h3>
                        <div className="space-y-1 text-sm">
                          <p className={textColor}>CNPJ: 48.594.326/0001-10</p>
                          <p className={textColor}>E-mail: ivonecufa@gmail.com</p>
                          <p className={textColor}>Contato: THALES PEREIRA ATHAYDE</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-full 
                          hover:bg-emerald-600 transition-colors">
                          Iniciar Inspeção
                        </button>
                        <button className="p-2 hover:bg-gray-700/30 rounded-full">
                          <Settings className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <select className={`px-4 py-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <option>Selecione ou adicione uma unidade</option>
                      </select>

                      <div className="flex gap-2">
                        <button className="text-emerald-400 hover:text-emerald-300">
                          Exportar CSV
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;