
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initOfflineSystem } from './services/offlineSync';
import { initOfflineDb } from './services/offlineDb';
import { toast } from 'sonner';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error reporting function for unhandled errors
const reportError = (error: Error, info: React.ErrorInfo) => {
  console.error("Unhandled application error:", error);
  console.error("Component stack:", info.componentStack || "No component stack available");
  toast.error("Ocorreu um erro inesperado", {
    description: error.message || "Tente recarregar a página",
    duration: 6000
  });
};

// Custom error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-6 m-4 border border-red-300 rounded bg-red-50">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro na Aplicação</h2>
          <p className="mb-4">Ocorreu um erro inesperado. Por favor, tente recarregar a página.</p>
          <p className="text-sm text-gray-600 mb-4">
            Erro: {this.state.error?.message || "Erro desconhecido"}
          </p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  toast.error("Erro de operação assíncrona", {
    description: event.reason?.message || "Uma operação falhou inesperadamente",
    duration: 5000
  });
});

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
