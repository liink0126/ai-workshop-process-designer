/**
 * 이용약관 컴포넌트
 */

import React from 'react';

interface TermsOfServiceProps {
  onClose?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">이용약관</h2>
          <p className="text-indigo-100 text-sm mt-1">AI 워크숍 프로세스 디자이너</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제1조 (목적)</h3>
            <p className="text-gray-700">
              본 약관은 Liink(이하 "회사")가 제공하는 AI 워크숍 프로세스 디자이너 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제2조 (AI 서비스 고지)</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <p className="text-gray-700 font-medium">
                본 서비스는 인공지능기본법 제31조에 따라 다음 사항을 고지합니다:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                <li>본 서비스는 <strong>생성형 인공지능(Google Gemini AI)</strong>을 기반으로 운영됩니다.</li>
                <li>워크숍 프로세스, 준비물, 퍼실리테이션 가이드 등의 결과물은 AI에 의해 자동 생성됩니다.</li>
                <li>모든 AI 생성 콘텐츠에는 "AI 생성" 표시가 명확하게 표기됩니다.</li>
                <li>AI 생성 결과물은 참고용이며, 실제 적용 시 전문가의 검토를 권장합니다.</li>
              </ol>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제3조 (서비스의 내용)</h3>
            <p className="text-gray-700 mb-2">회사가 제공하는 서비스의 내용은 다음과 같습니다:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>AI 기반 워크숍 프로세스 자동 생성</li>
              <li>워크숍 준비물 및 체크리스트 제공</li>
              <li>퍼실리테이션 가이드 생성</li>
              <li>워크숍 데이터 저장 및 관리</li>
              <li>생성된 워크숍 공유 기능</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제4조 (이용자의 의무)</h3>
            <p className="text-gray-700 mb-2">이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>타인의 정보 도용</li>
              <li>회사의 서비스 정보를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 조장하거나 상업적으로 이용하는 행위</li>
              <li>공공질서 및 미풍양속에 위반되는 내용의 정보, 문장, 도형, 음성 등을 타인에게 유포하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>AI 생성 콘텐츠를 자신이 직접 생성한 것처럼 허위로 표시하는 행위</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제5조 (AI 생성 콘텐츠의 책임)</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
              <p className="font-semibold text-orange-900 mb-2">⚠️ AI 생성 오류 및 책임 소재</p>
              <p className="text-sm text-orange-800">
                생성형 AI는 실수를 할 수 있습니다. AI가 생성한 워크숍 프로세스는 참고 자료로만 활용하시고, 
                <strong>실제 워크숍 진행 전에 반드시 전문가 또는 퍼실리테이터가 내용을 검토하고 수정해 주세요.</strong>
              </p>
            </div>
            <div className="text-gray-700 space-y-2">
              <p>
                ① AI가 생성한 워크숍 프로세스 및 관련 콘텐츠는 일반적인 가이드라인을 제공하는 것으로, 
                특정 상황에 대한 완벽한 해결책을 보장하지 않습니다.
              </p>
              <p>
                ② <strong>생성된 워크숍 프로세스의 실행 결과, 효과, 및 발생 가능한 모든 문제에 대한 책임은 이용자에게 있으며</strong>, 
                회사는 AI 생성 도구를 제공하는 것에 한정됩니다.
              </p>
              <p>
                ③ AI는 부정확하거나 불완전한 정보를 생성할 수 있으므로, <strong>중요한 워크숍의 경우 반드시 전문 퍼실리테이터의 
                검토 및 수정을 거쳐야 합니다.</strong>
              </p>
              <p>
                ④ 회사는 AI가 생성한 콘텐츠의 정확성, 완전성, 적시성, 적합성에 대해 어떠한 보증도 하지 않으며, 
                이를 사용함으로써 발생하는 직간접적 손해에 대해 책임지지 않습니다.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                💡 <strong>권장 사항:</strong> 생성된 워크숍 프로세스를 실제로 사용하기 전에 귀하의 조직 상황, 
                참여자 특성, 목표에 맞게 내용을 검토하고 조정하시기 바랍니다.
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제6조 (저작권)</h3>
            <div className="text-gray-700 space-y-2">
              <p>
                ① 서비스에서 제공하는 모든 콘텐츠(AI 생성 콘텐츠 포함)에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.
              </p>
              <p>
                ② 이용자가 AI를 통해 생성한 워크숍 프로세스는 개인적 또는 업무상 사용이 가능하나, 
                상업적 재판매 또는 재배포는 회사의 사전 승인이 필요합니다.
              </p>
              <p>
                ③ 이용자가 입력한 정보(3P: Purpose, Product, Participants)에 대한 권리는 이용자에게 있으며, 
                회사는 서비스 제공 목적으로만 사용합니다.
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제7조 (서비스 이용의 제한)</h3>
            <p className="text-gray-700">
              회사는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 
              경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제8조 (면책조항)</h3>
            <div className="text-gray-700 space-y-2">
              <p>
                ① 회사는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                서비스 제공에 대한 책임이 면제됩니다.
              </p>
              <p>
                ② 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애 또는 손해에 대하여 책임을 지지 않습니다.
              </p>
              <p>
                ③ 회사는 AI 생성 결과물의 정확성, 완전성, 적합성을 보장하지 않으며, 
                이를 활용한 워크숍 실행의 결과에 대해 책임지지 않습니다.
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">제9조 (분쟁 해결)</h3>
            <p className="text-gray-700">
              본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따르며, 
              서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>부칙</strong><br />
              본 약관은 2025년 1월 1일부터 시행됩니다.<br />
              본 약관은 인공지능기본법(2024년 제정) 제31조에 따라 작성되었습니다.
            </p>
          </section>
        </div>

        {onClose && (
          <div className="p-6 border-t">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

