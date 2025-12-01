import React, { useState, lazy, Suspense } from 'react';
import { useAuth } from '../lib/auth';
import { signOutUser } from '../lib/firebase';
import { LogoutIcon, BookOpenIcon, QuestionMarkCircleIcon } from './Icon';
import { Page } from '../App';

const AccountDeletionModal = lazy(() => import('./AccountDeletionModal').then(m => ({ default: m.AccountDeletionModal })));


const LiinkLogo: React.FC = () => (
    <svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" aria-label="Liink 로고">
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

interface HeaderProps {
    currentPage: string;
    setCurrentPage: (page: Page) => void;
    onOpenGuide?: () => void;
    onOpenFAQ?: () => void;
}


const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onOpenGuide, onOpenFAQ }) => {
  const { user, userProfile } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const NavLink: React.FC<{page: Page, children: React.ReactNode}> = ({ page, children }) => (
    <button 
      onClick={() => setCurrentPage(page)}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${currentPage === page ? 'font-bold text-indigo-600' : 'text-gray-500 hover:text-gray-900 font-medium'}`}
    >
      {children}
    </button>
  );

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    // 탈퇴 성공 시 자동으로 로그아웃됨 (Firebase deleteUser가 처리)
  };

  return (
    <>
      {showDeleteModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">로딩 중...</div>
          </div>
        }>
          <AccountDeletionModal
            onClose={() => setShowDeleteModal(false)}
            onSuccess={handleDeleteSuccess}
          />
        </Suspense>
      )}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} aria-label="홈으로">
              <LiinkLogo />
            </a>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 기반 서비스
            </span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <nav className="hidden sm:flex items-center gap-2">
                <NavLink page="home">새 워크숍 설계</NavLink>
                <NavLink page="history">My History</NavLink>
              </nav>
              <div className="flex items-center gap-4">
                {(onOpenGuide || onOpenFAQ) && (
                  <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
                    {onOpenGuide && (
                      <button 
                        onClick={onOpenGuide}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        title="사용자 가이드"
                      >
                        <BookOpenIcon />
                        <span className="hidden sm:inline">가이드</span>
                      </button>
                    )}
                    {onOpenFAQ && (
                      <button 
                        onClick={onOpenFAQ}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        title="자주 묻는 질문"
                      >
                        <QuestionMarkCircleIcon />
                        <span className="hidden sm:inline">FAQ</span>
                      </button>
                    )}
                  </div>
                )}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAccountMenu(!showAccountMenu)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <span className="hidden sm:inline">{userProfile?.displayName}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showAccountMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowAccountMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <div className="p-3 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">{userProfile?.displayName}</p>
                            <p className="text-xs text-gray-500">{userProfile?.email}</p>
                          </div>
                          <div className="py-2">
                            <button
                              onClick={() => {
                                setShowAccountMenu(false);
                                signOutUser();
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <LogoutIcon />
                              <span>로그아웃</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowAccountMenu(false);
                                setShowDeleteModal(true);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>회원 탈퇴</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </header>
    </>
  );
};

export default Header;