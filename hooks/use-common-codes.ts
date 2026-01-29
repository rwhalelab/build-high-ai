/**
 * 공통 코드 조회 훅
 * 
 * Client Component에서 사용하는 공통 코드 조회 커스텀 훅
 * useState로 코드 목록 캐싱
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface CommonCode {
  code: string;
  name: string;
}

/**
 * 공통 코드 조회 훅
 * 
 * @param masterCode 마스터 코드 (예: 'BH_ST_APPLICATION')
 * @returns 공통 코드 배열, 로딩 상태, 에러
 */
export function useCommonCodes(masterCode: string) {
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!masterCode) {
      setLoading(false);
      return;
    }

    const fetchCodes = async () => {
      if (!supabase) {
        console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
        setCodes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('common_code_detail')
          .select('code, name')
          .eq('master_code', masterCode)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setCodes(data || []);
      } catch (err) {
        console.error('공통 코드 조회 오류:', err);
        setError(err as Error);
        setCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, [masterCode, supabase]);

  return { codes, loading, error };
}

/**
 * 공통 코드 이름 조회 헬퍼 함수
 * 
 * @param codes 공통 코드 배열
 * @param code 조회할 코드 값
 * @returns 코드 이름 또는 코드 값 자체
 */
export function getCodeName(codes: CommonCode[], code: string): string {
  const found = codes.find((c) => c.code === code);
  return found?.name || code;
}
