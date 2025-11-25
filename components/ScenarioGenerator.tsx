import React, { useState, useEffect } from 'react';
import { getAllWorkshops } from '../lib/firebase';
import { WorkshopDocument, WorkshopStep } from '../types';
import WorkshopStepCard from './WorkshopStepCard';

interface AdminHistoryItemProps {
    workshop: WorkshopDocument;
}

// Fix: Changed to React.FC to correctly type a React component and handle the special 'key' prop.
const AdminHistoryItem: React.FC<AdminHistoryItemProps> = ({ workshop }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate">
                            {new Date(workshop.createdAt.seconds * 1000).toLocaleString('ko-KR')} - <span className="font-semibold text-pink-600">{workshop.userEmail}</span>
                        </p>
                         {workshop.workshopType && workshop.workshopType !== 'AI에게 추천받기' && (
                            <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                {workshop.workshopType}
                            </span>
                        )}
                        <h3 className="font-semibold text-slate-800 mt-1 truncate">{workshop.purpose || workshop.problem}</h3>
                    </div>
                    <div className="flex items-center gap-6 text-sm ml-4">
                       <div className="text-center hidden sm:block">
                            <p className="text-slate-500">시간</p>
                            <p className="font-bold text-slate-700">{workshop.duration}시간</p>
                        </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-slate-500">참여자</p>
                            <p className="font-bold text-slate-700">{workshop.participants}명</p>
                        </div>
                        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </button>
            {isOpen && (
                 <div className="p-4 sm:p-6 border-t border-slate-200/80 bg-slate-50/70 animate-fade-in">
                    <div className="space-y-4">
                       {workshop.plan.map((step, index) => (
                           <WorkshopStepCard 
                                key={index}
                                step={{ ...step, id: String(index) }}
                                onUpdate={() => {}} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function AdminPage(): React.ReactElement {
    const [workshops, setWorkshops] = useState<WorkshopDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const allWorkshops = await getAllWorkshops();
                setWorkshops(allWorkshops);
            } catch (err) {
                setError('워크숍 내역을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    return (
         <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">관리자 대시보드</h1>
            <p className="text-slate-600 mb-6">모든 사용자의 워크숍 설계 내역입니다.</p>
            {isLoading && <p>로딩 중...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && workshops.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl">
                  <p className="text-slate-500">아직 설계된 워크숍이 없습니다.</p>
                </div>
            )}
            <div className="space-y-4">
                {workshops.map((ws: WorkshopDocument) => (
                    <AdminHistoryItem key={ws.id} workshop={ws} />
                ))}
            </div>
        </div>
    );
}
