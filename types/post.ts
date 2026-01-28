/**
 * 게시글 관련 타입 정의
 */

import { Database } from './database';

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type PostCategory = 'Development' | 'Study' | 'Project';

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}
