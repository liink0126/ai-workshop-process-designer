import React, { useState, useEffect } from 'react';
import { getTechniqueDetails } from '../services/geminiService';
import { XMarkIcon } from './Icon';

interface TechniqueDetailPopoverProps {
  techniqueName: string;
  onClose: () => void;
}

const TechniqueDetailPopover: React.FC<TechniqueDetailPopoverProps> = ({ techniqueName, onClose }) => {
  const [data, setData] = useState<{ definition: string; rationale: string; alternatives: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await getTechniqueDetails(techniqueName);
        setData(result);
      } catch (err) {
        setError('정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [techniqueName]);

  return (
    <div className="w-72 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 animate-fade-in text-left">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
        <h4 className="font-bold text-slate-800">{techniqueName}</h4>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
          <XMarkIcon />
        </button>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center h-24">
            <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      )}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      
      {data && (
        <div className="space-y-3">
            <div>
                <h5 className="text-xs font-semibold text-slate-500">정의</h5>
                <p className="text-sm text-slate-700">{data.definition}</p>
            </div>
            <div>
                <h5 className="text-xs font-semibold text-slate-500">효과적인 이유</h5>
                <p className="text-sm text-slate-700">{data.rationale}</p>
            </div>
            <div>
                <h5 className="text-xs font-semibold text-slate-500">대체 기법</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                    {data.alternatives.map(alt => (
                        <span key={alt} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                            {alt}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TechniqueDetailPopover;
