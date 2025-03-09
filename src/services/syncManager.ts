import { SupabaseClient } from "@supabase/supabase-js";

interface SyncOperation {
  table: string;
  operationType: 'insert' | 'update' | 'delete';
  record: any;
}

export class SyncManager {
  private client: SupabaseClient;
  private operations: SyncOperation[] = [];
  private isSyncing: boolean = false;

  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  addOperation(operation: SyncOperation) {
    this.operations.push(operation);
    if (!this.isSyncing) {
      this.sync();
    }
  }

  private async sync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    while (this.operations.length > 0) {
      const operation = this.operations.shift();
      if (!operation) break;

      const { table, operationType, record } = operation;

      try {
        if (operationType === 'insert') {
          // Usar uma conversão de tipo (type assertion) para evitar recursão de tipos
          const { data, error } = await this.client
            .from(table)
            .insert(record) as unknown as { data: any; error: any };

          if (error) {
            console.error(`Erro ao inserir registro na tabela ${table}:`, error);
            // Lidar com o erro (por exemplo, readicionar a operação à fila ou registrar o erro)
          }
        } else if (operationType === 'update') {
          // Usar uma conversão de tipo (type assertion) para evitar recursão de tipos
          const { data, error } = await this.client
            .from(table)
            .upsert(operation.record) as unknown as { data: any; error: any };

          if (error) {
            console.error(`Erro ao atualizar registro na tabela ${table}:`, error);
            // Lidar com o erro
          }
        } else if (operationType === 'delete') {
          // Usar uma conversão de tipo (type assertion) para evitar recursão de tipos
          const { data, error } = await this.client
            .from(table)
            .delete()
            .match({ id: record.id }) as unknown as { data: any; error: any };

          if (error) {
            console.error(`Erro ao excluir registro da tabela ${table}:`, error);
            // Lidar com o erro
          }
        }
      } catch (error) {
        console.error("Erro durante a sincronização:", error);
        // Lidar com o erro geral de sincronização
      }
    }

    this.isSyncing = false;
  }
}
