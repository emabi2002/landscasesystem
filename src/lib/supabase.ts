import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string;
          case_number: string;
          title: string;
          description: string;
          status: string;
          case_type: string;
          created_at: string;
          updated_at: string;
          assigned_officer_id: string | null;
          region: string | null;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cases']['Insert']>;
      };
      parties: {
        Row: {
          id: string;
          case_id: string;
          name: string;
          type: string;
          contact_info: string | null;
          created_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          case_id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string;
          uploaded_by: string;
          uploaded_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          case_id: string;
          title: string;
          description: string | null;
          assigned_to: string;
          due_date: string;
          status: string;
          created_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          case_id: string;
          event_type: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          created_at: string;
        };
      };
      land_parcels: {
        Row: {
          id: string;
          case_id: string;
          parcel_number: string;
          location: string | null;
          coordinates: any | null;
          survey_plan_url: string | null;
          created_at: string;
        };
      };
    };
  };
};
