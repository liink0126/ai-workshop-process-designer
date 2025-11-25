import React from 'react';
import { WorkshopAnalysis } from '../types';
import { ShieldCheckIcon, LightBulbIcon } from './Icon';
import Gauge from './Gauge';

interface DifficultyAnalysisProps {
  analysis: WorkshopAnalysis;
  onConsult: () => void;
}

// Fix: Destructure onConsult from props to make it available in the component.
const DifficultyAnalysis: React.FC<DifficultyAnalysisProps> = ({ analysis, onConsult }) => {
  const needsExpert = analysis.difficulty === '어려움' || analysis.difficulty === '전문가 필요';

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-gray-50/80 no-print overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheckIcon />
            AI 진단 대시보드
          </h3>
          <p className="text-lg text-gray-600 mt-1">AI가 3P 분석을 바탕으로 워크숍의 성공 가능성을 진단했습니다.</p>
        </div>
        {needsExpert && (
           <div className="flex-shrink-0">
             <button 
                onClick={onConsult}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
                전문가 무료 상담
            </button>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        {/* Gauge and Reason */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center overflow-visible">
            <h4 className="text-lg font-bold text-gray-700 mb-4">필요 퍼실리테이터 역량</h4>
            <div className="my-4 overflow-visible">
              <Gauge value={analysis.facilitatorCompetency} />
            </div>
            <p className="text-sm sm:text-base text-gray-600 flex-grow mt-2">
                {analysis.difficultyReason}
            </p>
            <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded-md w-full">
                <p><span className="font-semibold">역량 수준:</span> 초급 (0-24), 중급 (25-49), 고급 (50-74), 전문가 (75-100)</p>
            </div>
        </div>

        {/* Key Success Factors */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <h4 className="text-lg font-bold text-gray-700 flex items-center gap-1.5 mb-4">
                <LightBulbIcon />
                핵심 성공 요인
            </h4>
            <div className="space-y-4">
                {analysis.keySuccessFactors.map((factor, index) => (
                    <div key={index} className="break-words">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base mb-1">{factor.title}</p>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{factor.description}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default DifficultyAnalysis;