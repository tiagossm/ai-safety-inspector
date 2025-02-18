<Sheet open={open} onOpenChange={onOpenChange}>
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-full max-w-2xl bg-background p-6 rounded-lg shadow-lg animate-fade-in">
      <SheetHeader>
        <SheetTitle className="text-center">
          {user ? "Editar Usuário" : "Novo Usuário"}
        </SheetTitle>
      </SheetHeader>

      <Tabs defaultValue="dados" className="mt-4">
        <TabsList className="flex justify-center gap-4">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
        </TabsList>

        {/* Seção de Dados */}
        <TabsContent value="dados" className="space-y-4 mt-4">
          <Input
            placeholder="Digite o nome do usuário"
            value={editedUser.name}
            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
          />
          <Input
            placeholder="Digite o email"
            type="email"
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
          />

          {/* Toggle Ativo/Inativo */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-medium">
              {editedUser.status === "active" ? "Usuário Ativo" : "Usuário Inativo"}
            </span>
            <Switch
              checked={editedUser.status === "active"}
              onCheckedChange={(checked) =>
                setEditedUser({ ...editedUser, status: checked ? "active" : "inactive" })
              }
            />
          </div>
        </TabsContent>

        {/* Seção de Atribuições */}
        <TabsContent value="atribuicoes" className="space-y-6 mt-4">
          <h3 className="text-md font-semibold">Empresas atribuídas</h3>
          <div className="space-y-2">
            {companies.map((company) => (
              <label key={company.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCompanies([...selectedCompanies, company.id]);
                    } else {
                      setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                    }
                  }}
                />
                {company.fantasy_name}
              </label>
            ))}
          </div>
        </TabsContent>

        {/* Seção de Permissões */}
        <TabsContent value="permissoes" className="space-y-4 mt-4">
          <h3 className="text-md font-semibold">Tipo de Perfil</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg">{roleIcons[editedUser.role]}</span>
            <select
              className="p-2 border rounded-md"
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as UserRole })}
            >
              <option value="Administrador">Administrador</option>
              <option value="Técnico">Técnico</option>
              <option value="Usuário">Usuário</option>
            </select>
          </div>
        </TabsContent>
      </Tabs>.

      {/* Botão de salvar */}
      <div className="mt-6">
        <Button onClick={handleSave} className="w-full" disabled={!editedUser.name || !editedUser.email || loading}>
          {loading ? "Salvando..." : user ? "Salvar Alterações" : "Criar Usuário"}
        </Button>
      </div>
    </div>
  </div>
</Sheet>
