import { supabase } from '@/integrations/supabase/client';
import { getSyncQueue, clearSyncItem } from './offlineDb';
import { getValidatedTable, isValidTable } from './tableValidation';

// Tipagem de resposta do Supabase (evita inferência excessiva)
interface SupabaseResponse {
  error: Error | null;
  data?: Record<string, any>;
}

// Tipagem simplificada para evitar aninhamentos profundos no TypeScript
interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, any>; // Evita inferência excessiva
  timestamp: number;
}

// Processamento genérico para operações no banco de dados
async function processSupabaseOperation(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: Record<string, any>
): Promise<void> {
  console.log(`🔄 Processando operação ${operation} para tabela: ${table}`);
  const validatedTable = getValidatedTable(table);
  
  let response: SupabaseResponse;
  if (operation === 'insert') {
    response = await supabase.from(validatedTable).insert(data) as SupabaseResponse;
  } else if (operation === 'update') {
    response = await supabase.from(validatedTable).update(data).eq('id', data.id) as SupabaseResponse;
  } else {
    response = await supabase.from(validatedTable).delete().eq('id', data.id) as SupabaseResponse;
  }

  if (response.error) {
    console.error(`❌ Erro na operação ${operation} na tabela ${table}:`, response.error);
    throw response.error;
  }
  console.log(`✅ ${operation.charAt(0).toUpperCase() + operation.slice(1)} realizado com sucesso em ${table}`);
}

// Função principal de sincronização
export async function syncWithServer(
  syncCallback?: (isSyncing: boolean) => void,
  errorCallback?: (error: Error) => void
): Promise<{ success: boolean; message?: string }> {
  try {
    syncCallback?.(true);
    
    const queue: SyncQueueItem[] = await getSyncQueue();
    if (queue.length === 0) {
      syncCallback?.(false);
      console.log('✅ Nenhum item para sincronizar.');
      return { success: true, message: "Nada para sincronizar." };
    }

    console.log(`🔄 Sincronizando ${queue.length} itens...`);

    let successCount = 0;
    let failureCount = 0;

    for (const item of queue) {
      try {
        if (!isValidTable(item.table)) {
          console.warn(`⚠️ Tabela inválida detectada: ${item.table}, pulando...`);
          await clearSyncItem(item.id);
          continue;
        }

        // Processa operação no Supabase
        await processSupabaseOperation(item.table, item.operation, item.data);

        // Remove item da fila após sincronização bem-sucedida
        await clearSyncItem(item.id);
        successCount++;
      } catch (error) {
        console.error(`❌ Falha ao sincronizar item ${item.id}:`, error);
        failureCount++;
      }
    }

    const remainingQueue = await getSyncQueue();
    syncCallback?.(false);

    return {
      success: remainingQueue.length === 0,
      message: remainingQueue.length === 0
        ? `✅ Todos os ${successCount} itens sincronizados com sucesso`
        : `✅ ${successCount} itens sincronizados, ❌ ${failureCount} falhas`
    };
  } catch (error) {
    console.error('❌ Falha geral na sincronização:', error);
    errorCallback?.(error as Error);
    syncCallback?.(false);
    return { success: false, message: "Erro desconhecido ao sincronizar." };
  }
}
