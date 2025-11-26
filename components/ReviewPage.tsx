import React, { useState } from 'react';
import { googleSignIn } from '../lib/firebase';

function LiinkLogo(): React.ReactElement {
    return (
        <svg width="150" height="60" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" aria-label="Liink 로고">
            <text x="50" y="28" 
                textAnchor="middle"
                fontFamily="var(--font-sans)" 
                fontSize="32" 
                fontWeight="bold" 
                fill="#4f46e5"
                letterSpacing="-0.5">
                liink
            </text>
        </svg>
    );
}


export function LoginPage(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await googleSignIn();
      // On successful sign-in, the onAuthStateChanged listener in AuthProvider
      // will handle the user state update and redirect to the main app.
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-grid-pattern flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full flex flex-col items-center">
            <LiinkLogo />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mt-4 text-gradient text-center">
                AI 워크숍 프로세스 디자이너
            </h1>
            <p className="mt-4 text-lg text-gray-600 text-center max-w-sm">
                Liink의 전문 지식으로 성공적인 워크숍을 설계하세요.
            </p>
        </div>

        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 mt-8 space-y-6">
            {error && <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
            
            <div>
                <h2 className="text-xl font-bold text-gray-800 text-center">시작하기</h2>
                <p className="text-center text-sm text-gray-500 mt-2">
                    Google 계정으로 로그인하고 바로 시작해 보세요.
                </p>
                 <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full mt-6 flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>로그인 중...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.692C34.522 5.92 29.632 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691c-1.221 2.22-1.856 4.805-1.856 7.559c0 2.754.635 5.338 1.856 7.559l-5.002 3.882C.54 30.563 0 27.42 0 24c0-3.42.54-6.563 1.304-9.449l5.002 3.14z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-4.792-3.715A11.953 11.953 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-4.99 3.883C10.198 39.427 16.634 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l4.792 3.715C39.977 34.509 42 30.025 42 24c0-1.772-.201-3.498-.567-5.143z"></path>
                            </svg>
                            <span>Google 계정으로 시작하기</span>
                        </>
                    )}
                </button>
             </div>
        </div>
    </div>
  );
}