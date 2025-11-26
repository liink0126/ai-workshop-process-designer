/**
 * Firebase 설정을 환경 변수에서 가져오기
 * zod로 검증된 환경 변수 사용
 */

import { env } from './env';

export const getFirebaseConfig = () => {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };

  // 필수 값 검증
  const requiredKeys: (keyof typeof config)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase 설정이 완전하지 않습니다. 다음 환경 변수가 필요합니다: ${missingKeys.join(', ')}`
    );
  }

  return config;
};

