import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import { AuthProvider } from './lib/auth';
import './src/index.css';

// Sentry 초기화
Sentry.init({
  dsn: "https://85c2e0f35265cb5b64f13efeb7f790e5@o4510378535747584.ingest.us.sentry.io/4510378541580288",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // 성능 모니터링 활성화
  tracesSampleRate: 1.0,
  // 릴리스 정보 (선택사항)
  // release: "ai-workshop-process-designer@0.0.0",
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error }) => (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-4">앱을 새로고침해 주세요.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            새로고침
          </button>
        </div>
      </div>
    )}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);