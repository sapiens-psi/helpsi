// Temporary types to fix build errors until Supabase regenerates types.ts
// This file can be removed once types.ts is fixed

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Views: {
      [key: string]: {
        Row: any;
      };
    };
    Functions: {
      [key: string]: any;
    };
    Enums: {
      user_role: "admin" | "specialist" | "client";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];