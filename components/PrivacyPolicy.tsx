/**
 * 개인정보 처리방침 컴포넌트
 */

import React from 'react';

interface PrivacyPolicyProps {
  onClose?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-indigo-600 text-white p-6">
          <h2 className="text-2xl font-bold">개인정보 처리방침</h2>
          <p className="text-indigo-100 text-sm mt-1">AI 워크숍 프로세스 디자이너</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">1. 개인정보의 처리 목적</h3>
            <p className="text-gray-700 mb-2">
              Liink(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
              이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li><strong>회원 가입 및 관리:</strong> Google OAuth를 통한 회원 가입, 본인 확인, 서비스 제공</li>
              <li><strong>AI 워크숍 생성 서비스 제공:</strong> 사용자가 입력한 워크숍 정보(3P)를 기반으로 AI 기반 워크숍 프로세스 생성</li>
              <li><strong>서비스 개선:</strong> 서비스 이용 기록 분석을 통한 서비스 품질 개선</li>
              <li><strong>데이터 저장 및 관리:</strong> 사용자가 생성한 워크숍 데이터의 저장 및 관리</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">2. 처리하는 개인정보 항목</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-gray-900 mb-2">▪ Google 로그인 시 수집 정보:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>이메일 주소</li>
                  <li>이름 (Google 계정 이름)</li>
                  <li>프로필 사진 (선택적)</li>
                  <li>Google 계정 고유 ID</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">▪ 서비스 이용 시 수집 정보:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>워크숍 정보 (Purpose, Product, Participants)</li>
                  <li>워크숍 설정 (유형, 시간, 참여자 수, 플립차트 유무)</li>
                  <li>서비스 이용 기록</li>
                  <li>생성된 워크숍 데이터</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">3. AI 처리 및 데이터 사용</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-purple-900 mb-2">
                  본 서비스는 생성형 AI(Google Gemini)를 사용하며, 다음과 같이 데이터를 처리합니다:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>사용자가 입력한 워크숍 정보는 Google Gemini AI에 전송되어 워크숍 프로세스 생성에 사용됩니다</li>
                  <li>Google의 개인정보 처리방침은 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Privacy Policy</a>를 참조하시기 바랍니다</li>
                  <li>AI 처리된 데이터는 워크숍 생성 목적으로만 사용되며, 제3자에게 제공되지 않습니다</li>
                  <li>회사는 AI 처리 과정에서 개인정보가 최소화되도록 노력합니다</li>
                </ul>
              </div>
              <div className="pt-2 border-t border-purple-200">
                <p className="font-medium text-purple-900 mb-1">📚 AI 학습 데이터 출처</p>
                <p className="text-sm text-gray-700">
                  본 AI는 <strong>Liink Consulting</strong>의 10년 이상 축적된 워크숍 설계 노하우, 
                  퍼실리테이션 방법론, 실제 교육 자료, 프로세스 디자인 사례, 그리고 수백 건의 
                  워크숍 진행 경험을 기반으로 학습되었습니다. 사용자의 개인정보는 AI 학습에 사용되지 않습니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">4. 개인정보의 처리 및 보유 기간</h3>
            <p className="text-gray-700 mb-3">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 
              개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▪ 서비스 이용 관련 정보</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                  <li><strong>회원정보 (이메일, 이름, 프로필):</strong> 회원 탈퇴 시까지 보관, 탈퇴 후 <strong>즉시 파기</strong></li>
                  <li><strong>워크숍 데이터 (생성된 프로세스, 3P 정보):</strong> 사용자가 삭제 요청 시까지 보관, 요청 시 <strong>즉시 파기</strong></li>
                  <li><strong>서비스 이용 기록 (접속 로그, 이용 기록):</strong> 수집일로부터 <strong>3개월</strong> 보관 후 자동 파기
                    <span className="text-xs text-gray-600"> (정보통신망법 제15조의2에 따름)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">▪ 법령에 따른 보존 의무</h4>
                <p className="text-xs text-gray-600 mb-2">관련 법령에 따라 일정 기간 보존해야 하는 정보는 아래와 같습니다:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                  <li><strong>계약 또는 청약철회 등에 관한 기록:</strong> <strong>5년</strong> 보관
                    <span className="text-xs text-gray-600"> (전자상거래법 제6조)</span>
                  </li>
                  <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> <strong>5년</strong> 보관
                    <span className="text-xs text-gray-600"> (전자상거래법 제6조)</span>
                  </li>
                  <li><strong>소비자 불만 또는 분쟁처리에 관한 기록:</strong> <strong>3년</strong> 보관
                    <span className="text-xs text-gray-600"> (전자상거래법 제6조)</span>
                  </li>
                  <li><strong>접속 로그 기록:</strong> <strong>3개월</strong> 보관
                    <span className="text-xs text-gray-600"> (통신비밀보호법 제15조의2)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">▪ 회원 탈퇴 시 처리</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                  <li>회원 탈퇴 요청 시 즉시 개인정보를 파기합니다</li>
                  <li>단, 법령에 따라 보존이 필요한 정보는 별도 DB에 분리 보관 후 법정 기간 경과 시 파기합니다</li>
                  <li>탈퇴 후 동일 이메일로 재가입 시 이전 정보는 복구되지 않습니다</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  💡 <strong>데이터 다운로드:</strong> 사용자는 언제든지 My History 페이지에서 자신의 워크숍 데이터를 
                  다운로드하거나 삭제할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">5. 개인정보의 제3자 제공</h3>
            <p className="text-gray-700">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
              단, Google Gemini AI 서비스 제공을 위해 Google에 워크숍 정보(3P)가 전송되며, 
              이는 서비스 제공을 위한 필수적인 처리입니다. Google의 데이터 처리 정책은 Google의 개인정보 처리방침을 따릅니다.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">6. 개인정보의 파기</h3>
            <div className="text-gray-700 space-y-2">
              <p>
                ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
                지체 없이 해당 개인정보를 파기합니다.
              </p>
              <p>
                ② 파기 절차 및 방법은 다음과 같습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>파기절차:</strong> 불필요한 개인정보는 개인정보 보호책임자의 승인을 거쳐 파기합니다.</li>
                <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제합니다.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">7. 정보주체의 권리·의무 및 행사방법</h3>
            <p className="text-gray-700 mb-2">
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="text-gray-700 mt-2">
              권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 
              회사는 이에 대해 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">8. 개인정보의 안전성 확보 조치</h3>
            <p className="text-gray-700 mb-2">
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Firebase Authentication을 통한 안전한 인증 관리</li>
              <li>Firestore 보안 규칙을 통한 데이터 접근 제어</li>
              <li>HTTPS를 통한 데이터 암호화 전송</li>
              <li>개인정보 취급 담당자의 최소화 및 교육</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">9. 개인정보 보호책임자</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 
                아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="text-gray-700 space-y-1">
                <p><strong>개인정보 보호책임자:</strong> Liink 운영팀</p>
                <p><strong>연락처:</strong> (서비스 내 문의 기능 이용)</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">10. 개인정보 처리방침 변경</h3>
            <p className="text-gray-700">
              이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 
              법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>부칙</strong><br />
              본 개인정보 처리방침은 2025년 1월 1일부터 시행됩니다.<br />
              본 처리방침은 개인정보 보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 
              인공지능기본법 등 관련 법령에 따라 작성되었습니다.
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

