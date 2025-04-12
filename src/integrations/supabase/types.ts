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
      automated_incidents: {
        Row: {
          created_at: string | null
          id: string
          inspection_id: string | null
          response_id: string | null
          trigger_condition: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          response_id?: string | null
          trigger_condition: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          response_id?: string | null
          trigger_condition?: Json
        }
        Relationships: [
          {
            foreignKeyName: "automated_incidents_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_incidents_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "inspection_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_action_plans: {
        Row: {
          checklist_item_id: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          responsible_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          checklist_item_id: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          responsible_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          checklist_item_id?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          responsible_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_action_plans_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
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
      checklist_attachments: {
        Row: {
          checklist_id: string
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_attachments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_attachments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_comments: {
        Row: {
          checklist_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          checklist_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          checklist_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_comments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_comments_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_history: {
        Row: {
          action: string
          checklist_id: string
          created_at: string
          details: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          checklist_id: string
          created_at?: string
          details: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          checklist_id?: string
          created_at?: string
          details?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_history_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_history_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_item_comments: {
        Row: {
          checklist_item_id: string
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          checklist_item_id: string
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          checklist_item_id?: string
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_comments_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_item_media: {
        Row: {
          checklist_item_id: string
          created_at: string | null
          file_name: string
          file_url: string
          id: string
          media_type: string
          user_id: string
        }
        Insert: {
          checklist_item_id: string
          created_at?: string | null
          file_name: string
          file_url: string
          id?: string
          media_type: string
          user_id: string
        }
        Update: {
          checklist_item_id?: string
          created_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          media_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_media_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_itens: {
        Row: {
          checklist_id: string
          condition_value: string | null
          created_at: string
          has_subchecklist: boolean | null
          hint: string | null
          id: string
          obrigatorio: boolean
          opcoes: Json | null
          ordem: number
          parent_item_id: string | null
          pergunta: string
          permite_audio: boolean | null
          permite_foto: boolean | null
          permite_video: boolean | null
          requires_action: boolean | null
          requires_barcode: boolean | null
          requires_location: boolean | null
          requires_signature: boolean | null
          sub_checklist_id: string | null
          tipo_resposta: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          checklist_id: string
          condition_value?: string | null
          created_at?: string
          has_subchecklist?: boolean | null
          hint?: string | null
          id?: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          parent_item_id?: string | null
          pergunta: string
          permite_audio?: boolean | null
          permite_foto?: boolean | null
          permite_video?: boolean | null
          requires_action?: boolean | null
          requires_barcode?: boolean | null
          requires_location?: boolean | null
          requires_signature?: boolean | null
          sub_checklist_id?: string | null
          tipo_resposta: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          checklist_id?: string
          condition_value?: string | null
          created_at?: string
          has_subchecklist?: boolean | null
          hint?: string | null
          id?: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          parent_item_id?: string | null
          pergunta?: string
          permite_audio?: boolean | null
          permite_foto?: boolean | null
          permite_video?: boolean | null
          requires_action?: boolean | null
          requires_barcode?: boolean | null
          requires_location?: boolean | null
          requires_signature?: boolean | null
          sub_checklist_id?: string | null
          tipo_resposta?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_itens_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_permissions: {
        Row: {
          checklist_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          checklist_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          checklist_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_permissions_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_permissions_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_sub_checklist: boolean | null
          is_template: boolean | null
          origin: string
          parent_question_id: string | null
          responsible_id: string | null
          status: string | null
          status_checklist: string
          title: string
          total_questions: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_sub_checklist?: boolean | null
          is_template?: boolean | null
          origin?: string
          parent_question_id?: string | null
          responsible_id?: string | null
          status?: string | null
          status_checklist?: string
          title: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_sub_checklist?: boolean | null
          is_template?: boolean | null
          origin?: string
          parent_question_id?: string | null
          responsible_id?: string | null
          status?: string | null
          status_checklist?: string
          title?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string | null
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
          {
            foreignKeyName: "checklists_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_checklists_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          admin_id: string | null
          cipa_dimensioning: Json | null
          cnae: string | null
          cnpj: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
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
          address?: string | null
          admin_id?: string | null
          cipa_dimensioning?: Json | null
          cnae?: string | null
          cnpj: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
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
          address?: string | null
          admin_id?: string | null
          cipa_dimensioning?: Json | null
          cnae?: string | null
          cnpj?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
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
        Relationships: [
          {
            foreignKeyName: "companies_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      inspection_ai_analysis: {
        Row: {
          inspection_id: string
          maintenance_recommendations: string[] | null
          predicted_issues: Json | null
          risk_score: number | null
        }
        Insert: {
          inspection_id: string
          maintenance_recommendations?: string[] | null
          predicted_issues?: Json | null
          risk_score?: number | null
        }
        Update: {
          inspection_id?: string
          maintenance_recommendations?: string[] | null
          predicted_issues?: Json | null
          risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_ai_analysis_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: true
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
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
      inspection_responses: {
        Row: {
          action_plan: string | null
          answer: string
          completed_at: string | null
          created_at: string | null
          id: string
          inspection_id: string | null
          media_urls: string[] | null
          notes: string | null
          question_id: string
          sub_checklist_responses: Json | null
          updated_at: string | null
        }
        Insert: {
          action_plan?: string | null
          answer: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          media_urls?: string[] | null
          notes?: string | null
          question_id: string
          sub_checklist_responses?: Json | null
          updated_at?: string | null
        }
        Update: {
          action_plan?: string | null
          answer?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          inspection_id?: string | null
          media_urls?: string[] | null
          notes?: string | null
          question_id?: string
          sub_checklist_responses?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_responses_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "checklist_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_signatures: {
        Row: {
          inspection_id: string
          signature_data: string
          signed_at: string | null
          signer_id: string
        }
        Insert: {
          inspection_id: string
          signature_data: string
          signed_at?: string | null
          signer_id: string
        }
        Update: {
          inspection_id?: string
          signature_data?: string
          signed_at?: string | null
          signer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_signatures_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: true
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          approval_notes: string | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          approved_by: string | null
          audio_url: string | null
          checklist: Json | null
          checklist_id: string | null
          cnae: string
          company_id: string | null
          created_at: string
          id: string
          inspection_type: string | null
          location: string | null
          metadata: Json | null
          photos: string[] | null
          priority: string | null
          report_url: string | null
          responsible_id: string | null
          risks: Json | null
          scheduled_date: string | null
          status: string | null
          sync_status: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_notes?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_by?: string | null
          audio_url?: string | null
          checklist?: Json | null
          checklist_id?: string | null
          cnae: string
          company_id?: string | null
          created_at?: string
          id?: string
          inspection_type?: string | null
          location?: string | null
          metadata?: Json | null
          photos?: string[] | null
          priority?: string | null
          report_url?: string | null
          responsible_id?: string | null
          risks?: Json | null
          scheduled_date?: string | null
          status?: string | null
          sync_status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_notes?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          approved_by?: string | null
          audio_url?: string | null
          checklist?: Json | null
          checklist_id?: string | null
          cnae?: string
          company_id?: string | null
          created_at?: string
          id?: string
          inspection_type?: string | null
          location?: string | null
          metadata?: Json | null
          photos?: string[] | null
          priority?: string | null
          report_url?: string | null
          responsible_id?: string | null
          risks?: Json | null
          scheduled_date?: string | null
          status?: string | null
          sync_status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inspections_checklist_id"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inspections_checklist_id"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inspections_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inspections_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      nr22_dimensionamento: {
        Row: {
          numero_empregados: string
          representantes_suplentes_empregador: number
          representantes_suplentes_empregados: number
          representantes_titulares_empregador: number
          representantes_titulares_empregados: number
        }
        Insert: {
          numero_empregados: string
          representantes_suplentes_empregador: number
          representantes_suplentes_empregados: number
          representantes_titulares_empregador: number
          representantes_titulares_empregados: number
        }
        Update: {
          numero_empregados?: string
          representantes_suplentes_empregador?: number
          representantes_suplentes_empregados?: number
          representantes_titulares_empregador?: number
          representantes_titulares_empregados?: number
        }
        Relationships: []
      }
      nr31_dimensionamento: {
        Row: {
          numero_trabalhadores: string
          representantes_empregador: number
          representantes_trabalhadores: number
        }
        Insert: {
          numero_trabalhadores: string
          representantes_empregador: number
          representantes_trabalhadores: number
        }
        Update: {
          numero_trabalhadores?: string
          representantes_empregador?: number
          representantes_trabalhadores?: number
        }
        Relationships: []
      }
      nr4_riscos: {
        Row: {
          cnae: string
          created_at: string | null
          grau_risco: number
          id: number
        }
        Insert: {
          cnae: string
          created_at?: string | null
          grau_risco: number
          id?: number
        }
        Update: {
          cnae?: string
          created_at?: string | null
          grau_risco?: number
          id?: number
        }
        Relationships: []
      }
      nr5_dimensionamento: {
        Row: {
          acima_10000_por_2500: number | null
          empregados_0_19: number | null
          empregados_1001_2500: number | null
          empregados_101_120: number | null
          empregados_121_140: number | null
          empregados_141_300: number | null
          empregados_20_29: number | null
          empregados_2501_5000: number | null
          empregados_30_50: number | null
          empregados_301_500: number | null
          empregados_5001_10000: number | null
          empregados_501_1000: number | null
          empregados_51_80: number | null
          empregados_81_100: number | null
          grau_de_risco: number
          numero_integrantes: string
        }
        Insert: {
          acima_10000_por_2500?: number | null
          empregados_0_19?: number | null
          empregados_1001_2500?: number | null
          empregados_101_120?: number | null
          empregados_121_140?: number | null
          empregados_141_300?: number | null
          empregados_20_29?: number | null
          empregados_2501_5000?: number | null
          empregados_30_50?: number | null
          empregados_301_500?: number | null
          empregados_5001_10000?: number | null
          empregados_501_1000?: number | null
          empregados_51_80?: number | null
          empregados_81_100?: number | null
          grau_de_risco: number
          numero_integrantes: string
        }
        Update: {
          acima_10000_por_2500?: number | null
          empregados_0_19?: number | null
          empregados_1001_2500?: number | null
          empregados_101_120?: number | null
          empregados_121_140?: number | null
          empregados_141_300?: number | null
          empregados_20_29?: number | null
          empregados_2501_5000?: number | null
          empregados_30_50?: number | null
          empregados_301_500?: number | null
          empregados_5001_10000?: number | null
          empregados_501_1000?: number | null
          empregados_51_80?: number | null
          empregados_81_100?: number | null
          grau_de_risco?: number
          numero_integrantes?: string
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
      platform: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      platform_alerts: {
        Row: {
          created_at: string | null
          id: string
          message: string
          resolved: boolean | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          resolved?: boolean | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          resolved?: boolean | null
          type?: string | null
        }
        Relationships: []
      }
      platform_companies: {
        Row: {
          company_id: string
          platform_id: string
        }
        Insert: {
          company_id: string
          platform_id: string
        }
        Update: {
          company_id?: string
          platform_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_companies_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platform"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metrics: {
        Row: {
          active_companies: number
          created_at: string | null
          id: string
          mrr: number
          total_inspections: number
        }
        Insert: {
          active_companies: number
          created_at?: string | null
          id?: string
          mrr: number
          total_inspections: number
        }
        Update: {
          active_companies?: number
          created_at?: string | null
          id?: string
          mrr?: number
          total_inspections?: number
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
          cipa_dimensioning: Json | null
          cnae: string | null
          cnpj: string
          company_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          employee_count: number | null
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
          cipa_dimensioning?: Json | null
          cnae?: string | null
          cnpj: string
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          employee_count?: number | null
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
          cipa_dimensioning?: Json | null
          cnae?: string | null
          cnpj?: string
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          employee_count?: number | null
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
            referencedRelation: "checklist_with_creator"
            referencedColumns: ["id"]
          },
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
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles_mapping: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_mapping_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
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
          tier: Database["public"]["Enums"]["user_tier"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
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
          tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
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
          tier?: Database["public"]["Enums"]["user_tier"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "active_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      checklist_with_creator: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string | null
          created_by_name: string | null
          description: string | null
          due_date: string | null
          id: string | null
          is_sub_checklist: boolean | null
          is_template: boolean | null
          origin: string | null
          parent_question_id: string | null
          responsible_id: string | null
          status: string | null
          status_checklist: string | null
          title: string | null
          total_questions: number | null
          updated_at: string | null
          user_id: string | null
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
          {
            foreignKeyName: "checklists_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_checklists_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      archive_company: {
        Args: { company_id: string }
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_cipa_dimensioning: {
        Args: { p_employee_count: number; p_cnae: string; p_risk_level: number }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      normalize_cnae: {
        Args: { cnae: string }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "company_admin"
        | "manager"
        | "inspector"
      approval_status: "pending" | "awaiting_approval" | "approved" | "rejected"
      inspection_status: "pending" | "in_progress" | "completed" | "archived"
      unit_type: "matriz" | "filial"
      user_tier: "super_admin" | "company_admin" | "consultant" | "technician"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "user",
        "super_admin",
        "company_admin",
        "manager",
        "inspector",
      ],
      approval_status: ["pending", "awaiting_approval", "approved", "rejected"],
      inspection_status: ["pending", "in_progress", "completed", "archived"],
      unit_type: ["matriz", "filial"],
      user_tier: ["super_admin", "company_admin", "consultant", "technician"],
    },
  },
} as const
