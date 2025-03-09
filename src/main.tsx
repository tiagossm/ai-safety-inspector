
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initOfflineSystem } from './services/offlineSync';
import { initOfflineDb } from './services/offlineDb';
import { toast } from 'sonner';

// Initialize offline database immediately with better error handling
initOfflineDb()
  .then(success => {
    console.log(`IndexedDB initialization ${success ? 'succeeded' : 'failed'}`);
    if (!success) {
      toast.error("Falha ao inicializar o banco de dados. Algumas funcionalidades podem estar indisponíveis.");
    }
  })
  .catch(error => {
    console.error("Critical error initializing IndexedDB:", error);
    toast.error("Erro ao inicializar o banco de dados. Por favor, recarregue a página.");
  });

// Initialize offline system with proper error handling
try {
  const cleanup = initOfflineSystem(
    (isOnline) => {
      console.log(`App is ${isOnline ? 'online' : 'offline'}`);
    },
    (isSyncing) => {
      console.log(`Sync status: ${isSyncing ? 'syncing' : 'idle'}`);
    },
    (error) => {
      console.error('Sync error:', error);
      // Show user-friendly error message for sync errors
      toast.error("Erro na sincronização. Algumas funcionalidades podem estar indisponíveis.");
    }
  );

  // We don't call cleanup() here as we want the offline system
  // to run for the lifetime of the application
} catch (error) {
  console.error("Failed to initialize offline system:", error);
  toast.error("Falha ao inicializar o sistema offline. A aplicação pode não funcionar corretamente.");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
