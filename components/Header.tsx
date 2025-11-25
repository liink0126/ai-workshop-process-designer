import React from 'react';
import { useAuth } from '../lib/auth';
import { signOutUser } from '../lib/firebase';
import { LogoutIcon, BookOpenIcon, QuestionMarkCircleIcon } from './Icon';
import { Page } from '../App';


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
  const { user, userProfile, isDevMode } = useAuth();
  
  const NavLink: React.FC<{page: Page, children: React.ReactNode}> = ({ page, children }) => (
    <button 
      onClick={() => setCurrentPage(page)}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${currentPage === page ? 'font-bold text-indigo-600' : 'text-gray-500 hover:text-gray-900 font-medium'}`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} aria-label="홈으로">
            <LiinkLogo />
          </a>
          {(user || isDevMode) && (
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
                {user ? (
                  <>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{userProfile?.displayName}</span>
                    <button onClick={signOutUser} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                        <LogoutIcon />
                        <span className="hidden sm:inline">로그아웃</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                    Developer Mode
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;