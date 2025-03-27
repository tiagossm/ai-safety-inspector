// ...imports mantidos

export function useInspections() {
  const [inspections, setInspections] = useState<InspectionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<InspectionFilters>({
    search: "",
    status: "all",
    priority: "all",
    companyId: "all",
    responsibleId: "all", 
    checklistId: "all",
    startDate: undefined,
    endDate: undefined
  });

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      let query = supabase
        .from("inspections")
        .select(`
          *,
          companies:company_id(id, fantasy_name),
          checklist:checklist_id(id, title, description)
        `);
      
      if (user.tier !== "super_admin") {
        query = query.or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      if (!data) return setInspections([]);

      const userIds = data.map(i => i.responsible_id).filter(Boolean);
      let responsiblesData = {};

      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, name, email, phone")
          .in("id", userIds);
        
        responsiblesData = (usersData || []).reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }

      const inspectionsWithProgress = await Promise.all(data.map(async (inspection: any) => {
        const { count: answered, error: respError } = await supabase
          .from('inspection_responses')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_id', inspection.id);

        const { count: total, error: totalError } = await supabase
          .from('checklist_itens')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_id', inspection.checklist_id);

        const progress = total ? Math.round((answered! / total) * 100) : 0;
        let status = inspection.status;

        if (progress === 100 && inspection.status !== 'completed') {
          // Atualiza no Supabase
          await supabase
            .from('inspections')
            .update({ status: 'completed' })
            .eq('id', inspection.id);
          status = 'completed';
        }

        return {
          ...inspection,
          title: inspection.checklist?.title || 'Sem título',
          description: inspection.checklist?.description,
          progress,
          status,
          company: inspection.companies || null,
          responsible: responsiblesData[inspection.responsible_id] || null
        };
      }));

      setInspections(inspectionsWithProgress);
    } catch (err: any) {
      console.error("Error fetching inspections:", err);
      setError(err.message);
      toast.error("Erro ao carregar inspeções", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [user]);

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        (inspection.title?.toLowerCase().includes(searchLower)) ||
        (inspection.company?.fantasy_name?.toLowerCase().includes(searchLower)) ||
        (inspection.responsible?.name?.toLowerCase().includes(searchLower));
      
      const matchesStatus = filters.status === "all" || inspection.status === filters.status;
      const matchesPriority = filters.priority === "all" || inspection.priority === filters.priority;
      const matchesCompany = filters.companyId === "all" || inspection.companyId === filters.companyId;
      const matchesResponsible = filters.responsibleId === "all" || inspection.responsibleId === filters.responsibleId;
      const matchesChecklist = filters.checklistId === "all" || inspection.checklistId === filters.checklistId;

      let matchesDate = true;
      if (filters.startDate) {
        const sched = new Date(inspection.scheduledDate || '');
        const start = new Date(filters.startDate);
        const end = filters.endDate ? new Date(filters.endDate) : start;
        sched.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        matchesDate = sched >= start && sched <= end;
      }

      return matchesSearch && matchesStatus && matchesPriority &&
             matchesCompany && matchesResponsible && matchesChecklist && matchesDate;
    });
  }, [inspections, filters]);

  return {
    inspections: filteredInspections,
    loading,
    error,
    fetchInspections,
    filters,
    setFilters
  };
}
