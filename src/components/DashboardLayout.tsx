function DashboardLayout({ children }: DashboardLayoutProps) {
  // ... outros códigos

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex ${mainBgColor}`}>
        
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 
          ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
          ${sidebarOpen ? 'w-64' : 'w-20'}`}>

          {/* Conteúdo da Sidebar (mesmo do seu código) */}
        </aside>

        {/* Conteúdo Principal */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          
          {/* Header Fixo */}
          <header className={`sticky top-0 z-40 flex items-center justify-between px-8 h-16 
            ${theme === 'dark' ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>

            {/* Links de Navegação */}

            {/* Elementos Direita */}
            <div className="flex items-center gap-6">
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none ${
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
                <User className="h-8 w-8 text-gray-400" />
              </button>
            </div>
          </header>

          {/* Área de Conteúdo */}
          <main className="flex-1 p-8">
            <Outlet /> {/* Mantenha apenas isso para rotas */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}