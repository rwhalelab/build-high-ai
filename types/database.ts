/**
 * Supabase 데이터베이스 타입 정의
 * 
 * 이 파일은 Supabase CLI로 자동 생성됩니다:
 * npx supabase gen types typescript --project-id <project-id> > types/database.ts
 * 
 * 또는 로컬 개발 시:
 * npx supabase gen types typescript --local > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          tech_stack: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          tech_stack?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          tech_stack?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          category: 'Development' | 'Study' | 'Project';
          content: string;
          summary: string[] | null;
          tags: string[] | null; // TEXT[]로 변경 (JSONB에서 변경)
          contact: string | null; // 기존 필드 (하위 호환성 유지)
          phone: string | null;
          email: string | null;
          contact_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          category: 'Development' | 'Study' | 'Project';
          content: string;
          summary?: string[] | null;
          tags?: string[] | null; // TEXT[]로 변경
          contact?: string | null; // 기존 필드 (하위 호환성 유지)
          phone?: string | null;
          email?: string | null;
          contact_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          category?: 'Development' | 'Study' | 'Project';
          content?: string;
          summary?: string[] | null;
          tags?: string[] | null; // TEXT[]로 변경
          contact?: string | null; // 기존 필드 (하위 호환성 유지)
          phone?: string | null;
          email?: string | null;
          contact_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          ip_address: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          ip_address?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string | null;
          ip_address?: string | null;
          viewed_at?: string;
        };
      };
      post_applications: {
        Row: {
          id: string;
          post_id: string;
          applicant_id: string;
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          applicant_id: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          applicant_id?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: 'login' | 'post_view' | 'post_create' | 'post_update' | 'post_delete' | 'profile_update' | 'application_create';
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: 'login' | 'post_view' | 'post_create' | 'post_update' | 'post_delete' | 'profile_update' | 'application_create';
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: 'login' | 'post_view' | 'post_create' | 'post_update' | 'post_delete' | 'profile_update' | 'application_create';
          metadata?: Json | null;
          created_at?: string;
        };
      };
      common_code_master: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      common_code_detail: {
        Row: {
          id: string;
          master_code: string;
          code: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          master_code: string;
          code: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          master_code?: string;
          code?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
