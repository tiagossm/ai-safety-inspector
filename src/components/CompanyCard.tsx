// 1. Status com Indicador Visual + Acessibilidade
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return { label: 'Ativo', color: 'bg-green-500', border: 'border-green-500' };
    case 'inactive': return { label: 'Inativo', color: 'bg-red-500', border: 'border-red-500' };
    case 'potential': return { label: 'Potencial', color: 'bg-blue-500', border: 'border-blue-500' };
    default: return { label: 'Desconhecido', color: 'bg-gray-500', border: 'border-gray-500' };
  }
};

// 2. Loading State para Contatos
const [isLoadingContacts, setIsLoadingContacts] = useState(false);

const loadContacts = async () => {
  setIsLoadingContacts(true);
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) setContacts(data);
  } finally {
    setIsLoadingContacts(false);
  }
};

// 3. Animação de Transição para Seções
<CompanyUnits 
  units={units} 
  expanded={unitsExpanded}
  className={unitsExpanded ? "animate-slide-down" : "animate-slide-up"} 
/>

// 4. Ícones Consistente com Design System (lucide-react)
<DropdownMenuItem onClick={() => setIsEditing(true)}>
  <Pencil className="h-4 w-4 mr-2" /> 
  Editar Empresa
</DropdownMenuItem>