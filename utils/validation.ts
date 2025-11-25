// 입력 검증 유틸리티

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePurpose = (purpose: string): ValidationResult => {
  if (!purpose.trim()) {
    return { isValid: false, error: '워크숍의 목적(Purpose)을 입력해 주세요.' };
  }
  if (purpose.trim().length < 10) {
    return { isValid: false, error: '워크숍 목적을 더 구체적으로 입력해 주세요. (최소 10자 이상)' };
  }
  if (purpose.trim().length > 500) {
    return { isValid: false, error: '워크숍 목적은 500자 이하로 입력해 주세요.' };
  }
  return { isValid: true };
};

export const validateProduct = (product: string): ValidationResult => {
  if (product.trim().length > 500) {
    return { isValid: false, error: '핵심 결과물은 500자 이하로 입력해 주세요.' };
  }
  return { isValid: true };
};

export const validateParticipantsInfo = (info: string): ValidationResult => {
  if (info.trim().length > 500) {
    return { isValid: false, error: '참여자 정보는 500자 이하로 입력해 주세요.' };
  }
  return { isValid: true };
};

export const validateParticipants = (participants: string): ValidationResult => {
  const num = parseInt(participants, 10);
  if (isNaN(num) || num < 1) {
    return { isValid: false, error: '참여자 수는 1명 이상이어야 합니다.' };
  }
  if (num > 100) {
    return { isValid: false, error: '참여자 수는 100명 이하여야 합니다.' };
  }
  return { isValid: true };
};

export const validateDuration = (duration: number): ValidationResult => {
  if (duration < 1 || duration > 24) {
    return { isValid: false, error: '워크숍 시간은 1시간 이상 24시간 이하여야 합니다.' };
  }
  return { isValid: true };
};

export const validateWorkshopForm = (form: {
  purpose: string;
  product: string;
  participantsInfo: string;
  participants: string;
  duration: number;
}): ValidationResult => {
  const purposeResult = validatePurpose(form.purpose);
  if (!purposeResult.isValid) return purposeResult;

  const productResult = validateProduct(form.product);
  if (!productResult.isValid) return productResult;

  const participantsInfoResult = validateParticipantsInfo(form.participantsInfo);
  if (!participantsInfoResult.isValid) return participantsInfoResult;

  const participantsResult = validateParticipants(form.participants);
  if (!participantsResult.isValid) return participantsResult;

  const durationResult = validateDuration(form.duration);
  if (!durationResult.isValid) return durationResult;

  return { isValid: true };
};

