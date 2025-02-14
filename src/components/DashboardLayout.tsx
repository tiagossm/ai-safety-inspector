// 1. Otimização do useEffect de status online
useEffect(() => {
  const updateOnlineStatus = () => {
    const wasOnline = isOnline;
    setIsOnline(navigator.onLine);
    
    if (!wasOnline && navigator.onLine) {
      SyncManager.getInstance().trySync(); // Usar singleton
      showToast('Conexão restaurada - Sincronizando dados...');
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
}, [isOnline]); // Adicionar dependência

// 2. Carregamento otimizado de dados offline
const loadOfflineData = useCallback(async () => {
  try {
    const dbInstance = await db;
    const tx = dbInstance.transaction('empresas', 'readonly');
    const storedData = await tx.store.getAll();
    
    if (storedData.length === 0 && !isOnline) {
      showOfflineWarning(); // Novo método de feedback visual
    }
    
    setLocalEmpresas(storedData);
  } catch (error) {
    console.error('Erro no carregamento offline:', error);
    trackError(error); // Integrar com serviço de monitoramento
  }
}, [isOnline]);

// 3. Controle de sincronização otimizado
const handleSync = useCallback(async () => {
  if (isOnline) {
    try {
      const pendingItems = await SyncManager.getInstance().getPendingItems();
      if (pendingItems.length > 0) {
        await SyncManager.getInstance().trySync();
        showToast(`Sincronizado ${pendingItems.length} itens`);
      }
    } catch (error) {
      console.error('Falha na sincronização:', error);
      trackSyncError(error);
    }
  }
}, [isOnline]);

// 4. Atualização do swipe handler para mobile
const handlers = useSwipeable({
  onSwipedLeft: () => isMobile && setSidebarOpen(false),
  onSwipedRight: () => isMobile && setSidebarOpen(true),
  trackMouse: true, // Permitir simulação de touch no desktop
  delta: 50 // Aumentar sensibilidade
});

// 5. Componente de Status de Conexão Melhorado
const ConnectionStatus = () => (
  <div className="flex items-center gap-2">
    {!isOnline && (
      <div className="flex items-center text-red-500">
        <WifiOff className="h-5 w-5" />
        <span className="ml-2 text-sm">Modo Offline</span>
      </div>
    )}
    <button 
      onClick={handleSync}
      className="text-sm bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
    >
      {isOnline ? 'Forçar Sincronização' : 'Tentar Reconexão'}
    </button>
  </div>
);