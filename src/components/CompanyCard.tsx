<div className="flex min-h-screen bg-background">
  {/* Sidebar */}
  <aside className="w-64 border-r border-border p-4">
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Menu</h2>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Building className="h-4 w-4 mr-2" />
          Empresas
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          Usuários
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <ClipboardList className="h-4 w-4 mr-2" />
          Inspeções
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </nav>
    </div>
  </aside>

  {/* Conteúdo Principal */}
  <main className="flex-1 p-8">
    {/* Cabeçalho com Ações */}
    <div className="flex justify-between items-center mb-8">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresas..."
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Importar CSV
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Empresa
        </Button>
      </div>
    </div>

    {/* Card da Empresa */}
    <Card className="bg-background">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">FAVELA HOLDING</h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">CNPJ: 48.594.326/0001-10</Badge>
                <Badge variant="outline">CNAE: 6462-0</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20">
                  Ativo
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            {/* Menu de opções */}
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Seção de Contato */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Contato Principal</h3>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>THALES PEREIRA ATHAYDE</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>homecufe@gmail.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>(21) 8437-5139</span>
            </p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button className="h-24 flex flex-col items-center justify-center">
            <ClipboardList className="h-6 w-6 mb-2" />
            Nova Inspeção
          </Button>
          <Button className="h-24 flex flex-col items-center justify-center">
            <Zap className="h-6 w-6 mb-2" />
            Dimensionar NRs
          </Button>
          <Button className="h-24 flex flex-col items-center justify-center">
            <DownloadCloud className="h-6 w-6 mb-2" />
            Exportar Relatório
          </Button>
          <Button className="h-24 flex flex-col items-center justify-center">
            <PlusCircle className="h-6 w-6 mb-2" />
            Adicionar Unidade
          </Button>
        </div>

        {/* Unidades Cadastradas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Unidades Cadastradas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span className="font-medium">Matriz</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Código: MAT-001
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </main>
</div>