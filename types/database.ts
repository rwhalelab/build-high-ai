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
          tags: Json | null;
          contact: string | null;
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
          tags?: Json | null;
          contact?: string | null;
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
          tags?: Json | null;
          contact?: string | null;
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
