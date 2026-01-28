/**
 * 기술 스택 선택기 컴포넌트
 * 
 * 사용자가 자신의 보유 기술 스택을 선택하는 컴포넌트
 * 다중 선택 가능
 */

'use client';

import { useState } from 'react';

interface TechStackSelectorProps {
  selectedTechs: string[];
  onChange: (techs: string[]) => void;
}

export function TechStackSelector({
  selectedTechs,
  onChange,
}: TechStackSelectorProps) {
  // TODO: 기술 스택 목록 정의 또는 API에서 가져오기
  // TODO: 다중 선택 UI 구현
  // TODO: 검색 기능 (Phase 2)
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        보유 기술 스택
      </label>
      {/* 기술 스택 선택 UI */}
    </div>
  );
}
