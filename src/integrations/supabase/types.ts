export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      checklist_assignments: {
        Row: {
          checklist_id: string
          company_id: string | null
          created_at: string
          employee_ids: string[] | null
          id: string
          status: string | null
          sync_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          checklist_id: string
          company_id?: string | null
          created_at?: string
          employee_ids?: string[] | null
          id?: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          checklist_id?: string
          company_id?: string | null
          created_at?: string
          employee_ids?: string[] | null
          id?: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnae: string | null
          cnpj: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deactivated_at: string | null
          employee_count: number | null
          fantasy_name: string | null
          id: string
          import_errors: Json | null
          import_status: string | null
          metadata: Json | null
          status: string
          sync_status: string | null
          user_id: string
        }
        Insert: {
          cnae?: string | null
          cnpj: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deactivated_at?: string | null
          employee_count?: number | null
          fantasy_name?: string | null
          id?: string
          import_errors?: Json | null
          import_status?: string | null
          metadata?: Json | null
          status?: string
          sync_status?: string | null
          user_id: string
        }
        Update: {
          cnae?: string | null
          cnpj?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deactivated_at?: string | null
          employee_count?: number | null
          fantasy_name?: string | null
          id?: string
          import_errors?: Json | null
          import_status?: string | null
          metadata?: Json | null
          status?: string
          sync_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_imports: {
        Row: {
          created_at: string
          error_log: Json | null
          failed_records: number | null
          filename: string
          id: string
          processed_records: number | null
          status: string | null
          total_records: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_log?: Json | null
          failed_records?: number | null
          filename: string
          id?: string
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_log?: Json | null
          failed_records?: number | null
          filename?: string
          id?: string
          processed_records?: number | null
          status?: string | null
          total_records?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          emails: string[] | null
          id: string
          name: string
          notes: string | null
          phones: string[] | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          emails?: string[] | null
          id?: string
          name: string
          notes?: string | null
          phones?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          emails?: string[] | null
          id?: string
          name?: string
          notes?: string | null
          phones?: string[] | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      inspection_files: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          id: string
          inspection_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          inspection_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          inspection_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_files_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          audio_url: string | null
          checklist: Json | null
          cnae: string
          created_at: string
          id: string
          photos: string[] | null
          report_url: string | null
          risks: Json | null
          status: string | null
          sync_status: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          checklist?: Json | null
          cnae: string
          created_at?: string
          id?: string
          photos?: string[] | null
          report_url?: string | null
          risks?: Json | null
          status?: string | null
          sync_status?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          checklist?: Json | null
          cnae?: string
          created_at?: string
          id?: string
          photos?: string[] | null
          report_url?: string | null
          risks?: Json | null
          status?: string | null
          sync_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nr4_riscos: {
        Row: {
          cnae: string
          created_at: string
          grau_risco: number
          id: string
        }
        Insert: {
          cnae: string
          created_at?: string
          grau_risco: number
          id?: string
        }
        Update: {
          cnae?: string
          created_at?: string
          grau_risco?: number
          id?: string
        }
        Relationships: []
      }
      nrs: {
        Row: {
          content: string
          id: number
          number: string
        }
        Insert: {
          content: string
          id?: number
          number: string
        }
        Update: {
          content?: string
          id?: number
          number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          action_plan: Json | null
          created_at: string
          id: string
          inspection_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plan?: Json | null
          created_at?: string
          id?: string
          inspection_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plan?: Json | null
          created_at?: string
          id?: string
          inspection_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_levels: {
        Row: {
          cnae: string
          created_at: string
          description: string | null
          id: string
          risk_level: string
        }
        Insert: {
          cnae: string
          created_at?: string
          description?: string | null
          id?: string
          risk_level: string
        }
        Update: {
          cnae?: string
          created_at?: string
          description?: string | null
          id?: string
          risk_level?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          address: string | null
          cnae: string | null
          cnpj: string
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          fantasy_name: string | null
          geolocation: string | null
          id: string
          parent_unit_id: string | null
          technical_responsible: string | null
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnae?: string | null
          cnpj: string
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          fantasy_name?: string | null
          geolocation?: string | null
          id?: string
          parent_unit_id?: string | null
          technical_responsible?: string | null
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnae?: string | null
          cnpj?: string
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          fantasy_name?: string | null
          geolocation?: string | null
          id?: string
          parent_unit_id?: string | null
          technical_responsible?: string | null
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_parent_unit_id_fkey"
            columns: ["parent_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assignments: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          status: string | null
          sync_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_checklists: {
        Row: {
          checklist_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          checklist_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_checklists_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_checklists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_imports: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_log: Json | null
          filename: string
          id: string
          processed_rows: number | null
          status: string | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          filename: string
          id?: string
          processed_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          filename?: string
          id?: string
          processed_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          email_secondary: string | null
          id: string
          name: string | null
          phone: string | null
          phone_secondary: string | null
          position: string | null
          role: string | null
          roles: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          email_secondary?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          phone_secondary?: string | null
          position?: string | null
          role?: string | null
          roles?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          email_secondary?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          phone_secondary?: string | null
          position?: string | null
          role?: string | null
          roles?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_companies: {
        Row: {
          cnae: string | null
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          deactivated_at: string | null
          employee_count: number | null
          fantasy_name: string | null
          id: string | null
          metadata: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          cnae?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          employee_count?: number | null
          fantasy_name?: string | null
          id?: string | null
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          cnae?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          employee_count?: number | null
          fantasy_name?: string | null
          id?: string | null
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_company: {
        Args: {
          company_id: string
        }
        Returns: undefined
      }
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      normalize_cnae: {
        Args: {
          cnae: string
        }
        Returns: string
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
      unit_type: "matriz" | "filial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
