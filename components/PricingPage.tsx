import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { addUserCredits } from '../lib/firebase';
import { Page } from '../App';

interface PricingPageProps {
    setCurrentPage: (page: Page) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ setCurrentPage }) => {
    const { user, refetchUserProfile } = useAuth();
    const [isLoading, setIsLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const creditPackages = [
        { credits: 3, price: 5000, name: 'Single Shot' },
        { credits: 10, price: 15000, name: 'Starter Pack', discount: '25%' },
        { credits: 25, price: 30000, name: 'Pro Pack', discount: '40%' },
    ];

    const handlePurchase = async (credits: number) => {
        if (!user) {
            setError('로그인이 필요합니다.');
            return;
        }
        
        setIsLoading(credits);
        setError(null);
        
        // This is a front-end simulation of a payment flow.
        // In a real application, this would involve server-side order creation
        // and a webhook from the payment provider to securely update credits.
        try {
            // Simulate payment processing time
            await new Promise(resolve => setTimeout(resolve, 1500));
            await addUserCredits(user.uid, credits);
            await refetchUserProfile(); // Update credit info in the header
            alert(`${credits}개의 크레딧이 성공적으로 충전되었습니다!`);
            setCurrentPage('home');
        } catch (err: any) {
            setError(err.message || '결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
                    크레딧 충전하기
                </h1>
                <p className="mt-3 text-lg text-slate-600">
                    AI 워크숍 설계를 위해 크레딧을 충전하세요. (1회 설계 = 1 크레딧)
                </p>
            </div>

            {error && <div className="mt-6 text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {creditPackages.map((pkg) => (
                    <div key={pkg.credits} className="relative bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60 flex flex-col items-center text-center transition-transform transform hover:-translate-y-2">
                        {pkg.discount && (
                            <span className="absolute -top-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                {pkg.discount} 할인
                            </span>
                        )}
                        <h2 className="text-xl font-bold text-slate-800">{pkg.name}</h2>
                        <div className="flex items-baseline gap-2 text-5xl font-extrabold text-indigo-600 my-6">
                            <span>{pkg.credits}</span>
                            <span className="text-2xl font-semibold text-slate-500">Credits</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-700">
                            {pkg.price.toLocaleString('ko-KR')}원
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            (부가세 포함)
                        </p>
                        <button
                            onClick={() => handlePurchase(pkg.credits)}
                            disabled={isLoading !== null}
                            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading === pkg.credits ? '처리 중...' : '충전하기'}
                        </button>
                    </div>
                ))}
            </div>
             <div className="text-center mt-12 text-sm text-slate-500 bg-slate-100 p-4 rounded-lg border border-slate-200">
                <p><strong>결제 안내:</strong> 현재 결제는 시뮬레이션으로 동작합니다.</p>
                <p className="mt-1">'충전하기' 버튼을 누르면 1.5초 후 성공으로 처리되며, 선택한 크레딧이 계정에 추가됩니다.</p>
            </div>
        </div>
    );
};

export default PricingPage;