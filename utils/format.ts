// 포맷팅 유틸리티 함수

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  let result = '';
  if (h > 0) result += `${h}시간 `;
  if (m > 0) result += `${m}분`;
  return result.trim();
};

