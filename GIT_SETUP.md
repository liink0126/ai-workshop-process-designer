# Git 설치 및 Vercel 배포 가이드

## 1. Git 설치하기

### Windows에서 Git 설치

1. **Git 공식 사이트에서 다운로드**
   - https://git-scm.com/download/win 접속
   - 자동으로 다운로드가 시작됩니다 (약 50MB)

2. **설치 실행**
   - 다운로드한 `.exe` 파일 실행
   - 기본 설정으로 설치 진행 (Next 클릭)
   - 설치 완료 후 **PowerShell을 재시작**하세요

3. **설치 확인**
   ```bash
   git --version
   ```
   - 버전이 표시되면 설치 완료!

## 2. Git 초기 설정

### 사용자 정보 설정 (최초 1회만)

**본인의 실제 이름과 이메일 주소를 입력하세요:**

```bash
# 예시 1: 본명 사용
git config --global user.name "홍길동"
git config --global user.email "hong@example.com"

# 예시 2: 영문 이름 사용
git config --global user.name "John Doe"
git config --global user.email "john.doe@example.com"

# 예시 3: GitHub 계정 이메일 사용 (권장)
git config --global user.name "Your GitHub Username"
git config --global user.email "your-github-email@example.com"
```

**설정 확인:**
```bash
git config --global user.name
git config --global user.email
```

> 💡 **참고**: 
> - `user.name`: 커밋에 표시될 이름 (본명 또는 GitHub 사용자명)
> - `user.email`: GitHub 계정 이메일과 동일하게 설정하는 것을 권장합니다
> - 이 정보는 모든 Git 저장소에서 사용되므로 한 번만 설정하면 됩니다

## 3. 프로젝트를 Git 저장소로 만들기

### 현재 프로젝트 디렉토리에서 실행:

```bash
# 1. Git 저장소 초기화
git init

# 2. 모든 파일 추가
git add .

# 3. 첫 커밋 생성
git commit -m "Initial commit"
```

## 4. GitHub에 업로드하기

### GitHub 저장소 생성

1. **GitHub.com 접속 및 로그인**
   - https://github.com 접속
   - 계정이 없으면 회원가입

2. **새 저장소 생성**
   - 우측 상단 "+" 버튼 > "New repository" 클릭
   - Repository name: `ai-workshop-process-designer` (원하는 이름)
   - Public 또는 Private 선택
   - **"Initialize this repository with a README" 체크 해제** (이미 파일이 있으므로)
   - "Create repository" 클릭

3. **로컬 저장소와 GitHub 연결**
   ```bash
   # GitHub에서 제공하는 명령어 사용 (저장소 생성 후 표시됨)
   git remote add origin https://github.com/your-username/ai-workshop-process-designer.git
   git branch -M main
   git push -u origin main
   ```

## 5. Vercel과 GitHub 연동

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **Vercel 로그인**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New" > "Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: **Vite** (자동 감지)
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **환경 변수 설정**
   - Settings > Environment Variables에서 추가:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 URL 확인

## 6. 업데이트 배포하기

### 코드 수정 후 배포하는 방법:

```bash
# 1. 변경사항 확인
git status

# 2. 변경된 파일 추가
git add .

# 3. 커밋 생성
git commit -m "업데이트 내용 설명"

# 4. GitHub에 푸시
git push

# 5. Vercel이 자동으로 배포 시작! (약 1-2분 소요)
```

## 장점

✅ **자동 배포**: GitHub에 푸시하면 자동으로 배포됨  
✅ **버전 관리**: 모든 변경사항 추적 가능  
✅ **협업 용이**: 여러 사람과 협업 가능  
✅ **백업**: GitHub에 코드가 안전하게 저장됨  
✅ **Preview 배포**: Pull Request마다 미리보기 배포 자동 생성

## 문제 해결

### Git 명령어가 인식되지 않는 경우
- PowerShell을 재시작하세요
- Git 설치 경로가 PATH에 포함되어 있는지 확인

### GitHub 푸시 시 인증 오류
```bash
# GitHub Personal Access Token 사용
# Settings > Developer settings > Personal access tokens > Generate new token
```

### Vercel 배포 실패 시
- Vercel 대시보드의 Deployments 탭에서 로그 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 빌드 명령어와 출력 디렉토리 확인

