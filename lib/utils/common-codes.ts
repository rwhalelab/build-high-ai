/**
 * 공통 코드 조회 유틸리티
 * 
 * Server Component에서 사용하는 공통 코드 조회 함수
 * common_code_detail 테이블에서 master_code로 필터링하여 조회
 */

import { createClient } from '@/lib/supabase/server';

export interface CommonCode {
  code: string;
  name: string;
}

/**
 * 공통 코드 상세 목록 조회
 * 
 * @param masterCode 마스터 코드 (예: 'BH_ST_APPLICATION')
 * @returns 공통 코드 배열 (sort_order 정렬)
 */
export async function getCommonCodes(
  masterCode: string
): Promise<CommonCode[]> {
  const supabase = await createClient();

  if (!supabase) {
    console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('common_code_detail')
      .select('code, name')
      .eq('master_code', masterCode)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('공통 코드 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('공통 코드 조회 예외:', err);
    return [];
  }
}

/**
 * 공통 코드 단일 조회
 * 
 * @param masterCode 마스터 코드
 * @param code 상세 코드
 * @returns 공통 코드 또는 null
 */
export async function getCommonCode(
  masterCode: string,
  code: string
): Promise<CommonCode | null> {
  const supabase = await createClient();

  if (!supabase) {
    console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('common_code_detail')
      .select('code, name')
      .eq('master_code', masterCode)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('공통 코드 조회 오류:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('공통 코드 조회 예외:', err);
    return null;
  }
}
