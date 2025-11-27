/**
 * participantsInfo 텍스트에서 참여자 수를 추출하는 유틸리티 함수
 * @param participantsInfo 참여자 정보 텍스트
 * @returns 추출된 참여자 수 (없으면 null)
 */
export function extractParticipantCount(participantsInfo: string): number | null {
  if (!participantsInfo || typeof participantsInfo !== 'string') {
    return null;
  }

  // 숫자 패턴 찾기 (예: "10명", "15명", "팀장급 10명", "12명의 참여자")
  const patterns = [
    /(\d+)\s*명/g,           // "10명", "15명"
    /(\d+)\s*인/g,           // "10인"
    /참여자\s*(\d+)/g,        // "참여자 10"
    /총\s*(\d+)/g,           // "총 10"
    /약\s*(\d+)/g,           // "약 10"
    /(\d+)\s*명의/g,         // "10명의"
  ];

  const foundNumbers: number[] = [];

  for (const pattern of patterns) {
    const matches = participantsInfo.matchAll(pattern);
    for (const match of matches) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0 && num <= 100) {
        foundNumbers.push(num);
      }
    }
  }

  // 가장 큰 숫자를 반환 (여러 숫자가 있을 경우)
  if (foundNumbers.length > 0) {
    return Math.max(...foundNumbers);
  }

  // 패턴 매칭 실패 시, 텍스트에서 숫자 직접 추출 시도
  const directNumberMatch = participantsInfo.match(/\b([1-9]\d?|100)\b/);
  if (directNumberMatch) {
    const num = parseInt(directNumberMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 100) {
      return num;
    }
  }

  return null;
}

