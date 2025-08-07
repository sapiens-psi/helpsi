export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }

      company_documents: {
        Row: {
          company_id: string | null
          id: string
          name: string
          uploaded_at: string | null
          url: string
        }
        Insert: {
          company_id?: string | null
          id?: string
          name: string
          uploaded_at?: string | null
          url: string
        }
        Update: {
          company_id?: string | null
          id?: string
          name?: string
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profile: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          site: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          site?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          site?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      coupons: {
        Row: {
          code: string
          created_at: string
          current_usage_count: number
          discount_type: string | null
          expires_at: string | null
          id: string
          individual_usage_limit: number
          is_active: boolean
          min_purchase_amount: number
          type: string
          updated_at: string
          usage_limit: number | null
          value: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_usage_count?: number
          discount_type?: string | null
          expires_at?: string | null
          id?: string
          individual_usage_limit?: number
          is_active?: boolean
          min_purchase_amount?: number
          type: string
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_usage_count?: number
          discount_type?: string | null
          expires_at?: string | null
          id?: string
          individual_usage_limit?: number
          is_active?: boolean
          min_purchase_amount?: number
          type?: string
          updated_at?: string
          usage_limit?: number | null
          value?: number | null
        }
        Relationships: []
      }

        ]
      }
      meeting_rooms: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          created_manually: boolean | null
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          room_token: string
          scheduled_at: string | null
          started_at: string | null
          type: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          created_manually?: boolean | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          room_token: string
          scheduled_at?: string | null
          started_at?: string | null
          type?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          created_manually?: boolean | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          room_token?: string
          scheduled_at?: string | null
          started_at?: string | null
          type?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pdf_materials: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_size?: number
          file_type?: string
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cidade: string | null
          cpf_cnpj: string
          created_at: string | null
          crp: string | null
          estado: string | null
          full_name: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          cpf_cnpj: string
          created_at?: string | null
          crp?: string | null
          estado?: string | null
          full_name: string
          id: string
          phone: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          cpf_cnpj?: string
          created_at?: string | null
          crp?: string | null
          estado?: string | null
          full_name?: string
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_config: {
        Row: {
          business_hours: Json | null
          created_at: string | null
          diasSemana: Json | null
          duracaoConsulta: number | null
          holidays: Json | null
          horarios: Json | null
          id: string
          intervaloEntreConsultas: number | null
          updated_at: string | null
        }
        Insert: {
          business_hours?: Json | null
          created_at?: string | null
          diasSemana?: Json | null
          duracaoConsulta?: number | null
          holidays?: Json | null
          horarios?: Json | null
          id?: string
          intervaloEntreConsultas?: number | null
          updated_at?: string | null
        }
        Update: {
          business_hours?: Json | null
          created_at?: string | null
          diasSemana?: Json | null
          duracaoConsulta?: number | null
          holidays?: Json | null
          horarios?: Json | null
          id?: string
          intervaloEntreConsultas?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_prices: {
        Row: {
          id: number
          posvenda: Json | null
          prevenda: Json | null
        }
        Insert: {
          id?: number
          posvenda?: Json | null
          prevenda?: Json | null
        }
        Update: {
          id?: number
          posvenda?: Json | null
          prevenda?: Json | null
        }
        Relationships: []
      }
      specialist_general_config: {
        Row: {
          advance_booking_days: number | null
          allow_weekend_bookings: boolean | null
          auto_confirm_bookings: boolean | null
          created_at: string | null
          id: string
          min_advance_hours: number | null
          reminder_hours_before: number | null
          send_reminder_emails: boolean | null
          specialist_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          allow_weekend_bookings?: boolean | null
          auto_confirm_bookings?: boolean | null
          created_at?: string | null
          id?: string
          min_advance_hours?: number | null
          reminder_hours_before?: number | null
          send_reminder_emails?: boolean | null
          specialist_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          allow_weekend_bookings?: boolean | null
          auto_confirm_bookings?: boolean | null
          created_at?: string | null
          id?: string
          min_advance_hours?: number | null
          reminder_hours_before?: number | null
          send_reminder_emails?: boolean | null
          specialist_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_general_config_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_schedule_blocks: {
        Row: {
          block_date: string
          created_at: string | null
          end_time: string | null
          id: string
          is_full_day: boolean | null
          reason: string | null
          specialist_id: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          block_date: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_full_day?: boolean | null
          reason?: string | null
          specialist_id: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          block_date?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_full_day?: boolean | null
          reason?: string | null
          specialist_id?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_schedule_blocks_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_schedule_config: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          consultation_duration: number | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          max_consultations_per_day: number | null
          specialist_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          consultation_duration?: number | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          max_consultations_per_day?: number | null
          specialist_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          consultation_duration?: number | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_consultations_per_day?: number | null
          specialist_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialist_schedule_config_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          specialist_id: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          specialist_id?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          specialist_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialist_schedules_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_default_specialist_schedule: {
        Args: { p_specialist_id: string }
        Returns: undefined
      }

      get_available_slots: {
        Args: { p_specialist_id: string; p_date: string; p_duration?: number }
        Returns: {
          slot_time: string
          slot_datetime: string
        }[]
      }
    }
    Enums: {
      consultation_status: "agendada" | "concluida" | "cancelada"
      consultation_type: "pos-compra" | "pre-compra"
      user_role: "admin" | "specialist" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      consultation_status: ["agendada", "concluida", "cancelada"],
      consultation_type: ["pos-compra", "pre-compra"],
      user_role: ["admin", "specialist", "client"],
    },
  },
} as const
