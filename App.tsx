import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import { LoginPage } from './components/ReviewPage';
import { HistoryPage } from './components/QuizGenerator';
import { useAuth } from './lib/auth';
import { WorkshopData } from './types';
import { getWorkshopById } from './lib/firebase';

// 코드 스플리팅: 사용 빈도가 낮은 컴포넌트는 lazy loading
const UserGuide = lazy(() => import('./components/UserGuide'));
const FAQ = lazy(() => import('./components/FAQ'));

export type Page = 'home' | 'history';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showGuide, setShowGuide] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [templateData, setTemplateData] = useState<WorkshopData | null>(null);
  const [sharedWorkshopId, setSharedWorkshopId] = useState<string | null>(null);

  // URL 파라미터에서 워크숍 ID 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const workshopId = urlParams.get('workshop');
    if (workshopId) {
      setSharedWorkshopId(workshopId);
      // 워크숍 로드
      getWorkshopById(workshopId).then((workshop) => {
        if (workshop) {
          const workshopData: WorkshopData = {
            purpose: workshop.purpose || '',
            product: workshop.product || '',
            participantsInfo: workshop.participantsInfo || '',
            workshopType: workshop.workshopType || 'AI에게 추천받기',
            duration: workshop.duration,
            participants: workshop.participants,
            flipchartAvailable: workshop.flipchartAvailable || false,
            plan: workshop.plan.map(step => ({ ...step, id: step.id || '' })),
            analysis: workshop.analysis,
          };
          setTemplateData(workshopData);
          setCurrentPage('home');
          // URL에서 파라미터 제거
          window.history.replaceState({}, '', window.location.pathname);
        }
      }).catch((err) => {
        console.error('워크숍 로드 실패:', err);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleUseTemplate = (template: { workshopData?: WorkshopData }) => {
    if (template.workshopData) {
      setTemplateData(template.workshopData);
      setCurrentPage('home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'history':
        return <HistoryPage onUseTemplate={handleUseTemplate} />;
      case 'home':
      default:
        return <HomePage setCurrentPage={setCurrentPage} templateData={templateData} onTemplateUsed={() => setTemplateData(null)} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f7f8fa] bg-grid-pattern">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onOpenGuide={() => setShowGuide(true)}
        onOpenFAQ={() => setShowFAQ(true)}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {renderPage()}
      </main>
      <Footer />
      {showGuide && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">로딩 중...</div>
          </div>
        }>
          <UserGuide onClose={() => setShowGuide(false)} />
        </Suspense>
      )}
      {showFAQ && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">로딩 중...</div>
          </div>
        }>
          <FAQ onClose={() => setShowFAQ(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default App;