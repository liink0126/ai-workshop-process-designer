import React, { useState, useEffect, useMemo } from 'react';
import { getUserWorkshops, saveWorkshop, saveWorkshopAsTemplate, getUserTemplates, deleteTemplate, deleteWorkshop, getWorkshopById } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { WorkshopDocument, WorkshopStep, WorkshopData, WorkshopTemplate } from '../types';
import WorkshopStepCard from './WorkshopStepCard';
import { DocumentDuplicateIcon, BookmarkIcon, XMarkIcon, TrashIcon, ShareIcon, MagnifyingGlassIcon, FunnelIcon, CalendarIcon } from './Icon';
import ErrorMessage from './ErrorMessage';
import ShareModal from './ShareModal';
import { Page } from '../App';
import { WORKSHOP_TYPES } from '../config/constants';

interface HistoryItemProps {
    workshop: WorkshopDocument;
    onCopy: (workshop: WorkshopDocument) => void;
    onSaveAsTemplate: (workshop: WorkshopDocument) => void;
    onShare: (workshop: WorkshopDocument) => void;
    onDelete: (workshopId: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ workshop, onCopy, onSaveAsTemplate, onShare, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleUpdateStep = (updatedStep: WorkshopStep) => {
        console.log("Update requested for step:", updatedStep);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300">
            <div className="p-4">
                <div className="flex justify-between items-start gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex-1 text-left hover:bg-gray-50/50 transition-colors rounded-lg p-2 -m-2"
                        aria-expanded={isOpen}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">{new Date(workshop.createdAt.seconds * 1000).toLocaleString('ko-KR')}</p>
                                {workshop.workshopType && workshop.workshopType !== 'AI에게 추천받기' && (
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                        {workshop.workshopType}
                                    </span>
                                )}
                                <h3 className="font-semibold text-gray-800 mt-1 truncate">{workshop.purpose || workshop.problem}</h3>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6 text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500 text-xs">시간</p>
                                    <p className="font-bold text-gray-700">{workshop.duration}시간</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500 text-xs">참여자</p>
                                    <p className="font-bold text-gray-700">{workshop.participants}명</p>
                                </div>
                                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                        onClick={() => onCopy(workshop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="워크숍 복사"
                    >
                        <DocumentDuplicateIcon />
                        <span className="hidden sm:inline">복사</span>
                    </button>
                    <button
                        onClick={() => onShare(workshop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="워크숍 공유"
                    >
                        <ShareIcon />
                        <span className="hidden sm:inline">공유</span>
                    </button>
                    <button
                        onClick={() => onSaveAsTemplate(workshop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="템플릿으로 저장"
                    >
                        <BookmarkIcon />
                        <span className="hidden sm:inline">템플릿 저장</span>
                    </button>
                    <button
                        onClick={() => onDelete(workshop.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="워크숍 삭제"
                    >
                        <TrashIcon />
                        <span className="hidden sm:inline">삭제</span>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50/70 animate-fade-in">
                    <div className="space-y-4">
                       {workshop.plan.map((step, index) => (
                           <WorkshopStepCard 
                                key={index}
                                step={{ ...step, id: String(index) }}
                                onUpdate={handleUpdateStep} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface TemplateItemProps {
    template: WorkshopTemplate;
    onUse: (template: WorkshopTemplate) => void;
    onDelete: (templateId: string) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onUse, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <BookmarkIcon />
                        <h3 className="font-semibold text-gray-800">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        {new Date(template.createdAt?.seconds * 1000 || Date.now()).toLocaleString('ko-KR')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUse(template)}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                        사용
                    </button>
                    <button
                        onClick={() => onDelete(template.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="템플릿 삭제"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface HistoryPageProps {
    onUseTemplate?: (template: WorkshopTemplate) => void;
}

export function HistoryPage({ onUseTemplate }: HistoryPageProps): React.ReactElement {
    const { user } = useAuth();
    const [workshops, setWorkshops] = useState<WorkshopDocument[]>([]);
    const [templates, setTemplates] = useState<WorkshopTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'workshops' | 'templates'>('workshops');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopDocument | null>(null);
    const [templateName, setTemplateName] = useState('');
    
    // 검색 및 필터링 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('전체');
    const [filterDateRange, setFilterDateRange] = useState<'전체' | '오늘' | '이번 주' | '이번 달' | '최근 3개월'>('전체');
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharedWorkshop, setSharedWorkshop] = useState<WorkshopDocument | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const [userWorkshops, userTemplates] = await Promise.all([
                        getUserWorkshops(user.uid),
                        getUserTemplates(user.uid)
                    ]);
                    setWorkshops(userWorkshops);
                    setTemplates(userTemplates);
                } catch (err) {
                    setError('데이터를 불러오는 데 실패했습니다.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const handleCopyWorkshop = async (workshop: WorkshopDocument) => {
        if (!user) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            const workshopData: WorkshopData = {
                purpose: workshop.purpose || '',
                product: workshop.product || '',
                participantsInfo: workshop.participantsInfo || '',
                workshopType: workshop.workshopType || 'AI에게 추천받기',
                duration: workshop.duration,
                participants: workshop.participants,
                flipchartAvailable: workshop.flipchartAvailable || false,
                plan: workshop.plan,
                analysis: workshop.analysis,
            };

            await saveWorkshop(workshopData);
            
            // 워크숍 목록 새로고침
            const userWorkshops = await getUserWorkshops(user.uid);
            setWorkshops(userWorkshops);
            
            setError(null);
        } catch (err) {
            setError('워크숍 복사에 실패했습니다. 다시 시도해 주세요.');
            console.error(err);
        }
    };

    const handleSaveAsTemplate = (workshop: WorkshopDocument) => {
        setSelectedWorkshop(workshop);
        setTemplateName(`${workshop.purpose || '워크숍'} 템플릿`);
        setShowTemplateModal(true);
    };

    const handleConfirmSaveTemplate = async () => {
        if (!selectedWorkshop || !templateName.trim()) {
            setError('템플릿 이름을 입력해 주세요.');
            return;
        }

        try {
            await saveWorkshopAsTemplate(selectedWorkshop.id, templateName.trim());
            const userTemplates = await getUserTemplates(user!.uid);
            setTemplates(userTemplates);
            setShowTemplateModal(false);
            setSelectedWorkshop(null);
            setTemplateName('');
            setError(null);
        } catch (err) {
            setError('템플릿 저장에 실패했습니다. 다시 시도해 주세요.');
            console.error(err);
        }
    };

    const handleUseTemplate = (template: WorkshopTemplate) => {
        if (onUseTemplate) {
            onUseTemplate(template);
        } else {
            alert('템플릿 사용 기능을 사용할 수 없습니다.');
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm('템플릿을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteTemplate(templateId);
            const userTemplates = await getUserTemplates(user!.uid);
            setTemplates(userTemplates);
            setError(null);
        } catch (err) {
            setError('템플릿 삭제에 실패했습니다. 다시 시도해 주세요.');
            console.error(err);
        }
    };

    const handleDeleteWorkshop = async (workshopId: string) => {
        if (!confirm('워크숍을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            await deleteWorkshop(workshopId);
            const userWorkshops = await getUserWorkshops(user!.uid);
            setWorkshops(userWorkshops);
            setError(null);
        } catch (err) {
            setError('워크숍 삭제에 실패했습니다. 다시 시도해 주세요.');
            console.error(err);
        }
    };

    const handleShareWorkshop = (workshop: WorkshopDocument) => {
        setSharedWorkshop(workshop);
        setShowShareModal(true);
    };

    // 필터링된 워크숍 목록
    const filteredWorkshops = useMemo(() => {
        let filtered = [...workshops];

        // 검색 필터
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ws => 
                (ws.purpose || '').toLowerCase().includes(query) ||
                (ws.product || '').toLowerCase().includes(query) ||
                (ws.participantsInfo || '').toLowerCase().includes(query) ||
                (ws.workshopType || '').toLowerCase().includes(query)
            );
        }

        // 유형 필터
        if (filterType !== '전체') {
            filtered = filtered.filter(ws => ws.workshopType === filterType);
        }

        // 날짜 필터
        if (filterDateRange !== '전체') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(ws => {
                const createdAt = new Date(ws.createdAt.seconds * 1000);
                const createdDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
                
                switch (filterDateRange) {
                    case '오늘':
                        return createdDate.getTime() === today.getTime();
                    case '이번 주':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return createdDate >= weekAgo;
                    case '이번 달':
                        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                    case '최근 3개월':
                        const threeMonthsAgo = new Date(today);
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        return createdDate >= threeMonthsAgo;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [workshops, searchQuery, filterType, filterDateRange]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">My History</h1>
            
            {/* 탭 */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('workshops')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'workshops'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    워크숍 ({workshops.length})
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'templates'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    템플릿 ({templates.length})
                </button>
            </div>

            {/* 검색 및 필터 (워크숍 탭일 때만 표시) */}
            {activeTab === 'workshops' && workshops.length > 0 && (
                <div className="mb-6 space-y-4">
                    {/* 검색 바 */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="워크숍 검색 (제목, 목적, 결과물 등)..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <XMarkIcon />
                            </button>
                        )}
                    </div>

                    {/* 필터 버튼 및 필터 UI */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                showFilters || filterType !== '전체' || filterDateRange !== '전체'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FunnelIcon />
                            <span>필터</span>
                            {(filterType !== '전체' || filterDateRange !== '전체') && (
                                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {(filterType !== '전체' ? 1 : 0) + (filterDateRange !== '전체' ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {/* 필터 초기화 버튼 */}
                        {(filterType !== '전체' || filterDateRange !== '전체' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setFilterType('전체');
                                    setFilterDateRange('전체');
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                필터 초기화
                            </button>
                        )}
                    </div>

                    {/* 필터 옵션 */}
                    {showFilters && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 animate-fade-in">
                            {/* 워크숍 유형 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    워크숍 유형
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['전체', ...WORKSHOP_TYPES].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                filterType === type
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 날짜 범위 필터 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CalendarIcon />
                                    날짜 범위
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['전체', '오늘', '이번 주', '이번 달', '최근 3개월'].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setFilterDateRange(range as '전체' | '오늘' | '이번 주' | '이번 달' | '최근 3개월')}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                filterDateRange === range
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 검색 결과 카운트 */}
                    {filteredWorkshops.length !== workshops.length && (
                        <p className="text-sm text-gray-500">
                            {filteredWorkshops.length}개의 워크숍이 검색되었습니다.
                        </p>
                    )}
                </div>
            )}

            {error && (
                <ErrorMessage 
                    message={error}
                    onClose={() => setError(null)}
                    type="error"
                />
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'workshops' && (
                        <>
                            {workshops.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p className="text-gray-500">아직 설계한 워크숍이 없습니다.</p>
                                    <p className="text-sm text-gray-400 mt-2">'새 워크숍 설계' 탭에서 첫 워크숍을 만들어보세요!</p>
                                </div>
                            ) : filteredWorkshops.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p className="text-gray-500">검색 조건에 맞는 워크숍이 없습니다.</p>
                                    <p className="text-sm text-gray-400 mt-2">필터를 조정하거나 검색어를 변경해보세요.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredWorkshops.map((ws: WorkshopDocument) => (
                                        <HistoryItem 
                                            key={ws.id} 
                                            workshop={ws}
                                            onCopy={handleCopyWorkshop}
                                            onSaveAsTemplate={handleSaveAsTemplate}
                                            onShare={handleShareWorkshop}
                                            onDelete={handleDeleteWorkshop}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'templates' && (
                        <>
                            {templates.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <p className="text-gray-500">저장된 템플릿이 없습니다.</p>
                                    <p className="text-sm text-gray-400 mt-2">워크숍을 템플릿으로 저장하면 여기에 표시됩니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {templates.map((template) => (
                                        <TemplateItem
                                            key={template.id}
                                            template={template}
                                            onUse={handleUseTemplate}
                                            onDelete={handleDeleteTemplate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* 템플릿 저장 모달 */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">템플릿으로 저장</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                템플릿 이름
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="템플릿 이름을 입력하세요"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowTemplateModal(false);
                                    setSelectedWorkshop(null);
                                    setTemplateName('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmSaveTemplate}
                                className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 공유 모달 */}
            {showShareModal && sharedWorkshop && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => {
                        setShowShareModal(false);
                        setSharedWorkshop(null);
                    }}
                    workshopId={sharedWorkshop.id}
                    workshopTitle={sharedWorkshop.purpose || sharedWorkshop.problem || '워크숍'}
                />
            )}
        </div>
    );
}
