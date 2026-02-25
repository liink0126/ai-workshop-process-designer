import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged, 
  signOut,
  deleteUser,
  reauthenticateWithRedirect,
  User
} from "firebase/auth";
import { 
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy,
    deleteDoc,
    updateDoc,
    increment,
} from "firebase/firestore/lite";
import type { UserProfile, WorkshopData, WorkshopDocument, WorkshopTemplate, WorkshopFeedback } from "../types";
import { getFirebaseConfig } from "../config/firebase.config";

// Initialize Firebase with environment variables
let app;
try {
  const firebaseConfig = getFirebaseConfig();
  app = initializeApp(firebaseConfig);
} catch (error) {
  const isDevelopment = import.meta.env.DEV || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';
  
  if (!isDevelopment) {
    console.error("Firebase 초기화 실패:", error);
    throw new Error(
      "프로덕션 환경에서는 Firebase 환경 변수가 필수입니다. " +
      "VITE_FIREBASE_* 환경 변수를 설정해주세요."
    );
  }
  
  // 개발 환경에서는 더 친화적인 에러 메시지
  console.error("Firebase 초기화 실패:", error);
  console.error("\n=== 로컬 개발 환경 설정 가이드 ===");
  console.error("1. 프로젝트 루트에 .env 파일을 생성하세요");
  console.error("2. .env.example 파일을 참고하여 환경 변수를 설정하세요");
  console.error("3. Firebase Console에서 프로젝트 설정을 확인하세요");
  console.error("4. Gemini API 키는 Google AI Studio에서 발급받으세요");
  console.error("=====================================\n");
  
  throw new Error(
    "Firebase 환경 변수가 설정되지 않았습니다.\n\n" +
    "로컬 개발을 위해 다음 단계를 따라주세요:\n" +
    "1. 프로젝트 루트에 .env 파일 생성\n" +
    "2. .env.example을 참고하여 환경 변수 설정\n" +
    "3. npm run dev로 다시 실행\n\n" +
    "자세한 내용은 README.md를 참고하세요."
  );
}

export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

// --- Device ID ---
function getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}


// --- Authentication ---

export const googleSignIn = async (): Promise<void> => {
    try {
        await signInWithRedirect(auth, provider);
    } catch (error) {
        if (error instanceof Error && error.message.includes('network')) {
            throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.');
        }
        throw error;
    }
};

export const handleRedirectResult = async (): Promise<User | null> => {
    try {
        const result = await getRedirectResult(auth);
        if (!result) return null;
        
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            const currentDeviceId = getDeviceId();
            if (userProfile.registeredDeviceId && userProfile.registeredDeviceId !== currentDeviceId) {
                await signOut(auth);
                throw new Error('이 계정은 다른 기기에 등록되어 있습니다. 등록된 기기에서만 접속할 수 있습니다.');
            }
        } else {
            await handleNewUserRegistration(user);
        }
        return user;
    } catch (error) {
        if (error instanceof Error && error.message.includes('network')) {
            throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.');
        }
        throw error;
    }
};

export const handleNewUserRegistration = async (user: User) => {
    const deviceId = getDeviceId();
    const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user',
        registeredDeviceId: deviceId,
    };
    
    try {
        await setDoc(doc(db, 'users', user.uid), newUserProfile);
    } catch (error) {
        console.error("Failed to create user profile:", error);
        // If profile creation fails, sign out to prevent inconsistent state
        await signOut(auth);
        throw new Error("계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};


export const signOutUser = () => signOut(auth);

export const onAuthUserStateChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * 회원 탈퇴 - 개인정보 보호법 준수
 * 사용자 계정 및 모든 관련 데이터를 삭제합니다.
 */
export const deleteUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("로그인된 사용자가 없습니다.");
    }

    try {
        // 1. 재인증 (보안을 위해 - Google 로그인의 경우 최근 로그인이 필요할 수 있음)
        try {
            await reauthenticateWithRedirect(user, provider);
        } catch (reauthError) {
            console.warn("재인증 실패, 계속 진행:", reauthError);
            // 재인증 실패해도 계속 진행 (최근에 로그인한 경우)
        }

        // 2. Firestore에서 사용자가 생성한 모든 워크숍 삭제
        const workshopsRef = collection(db, "workshops");
        const userWorkshopsQuery = query(workshopsRef, where("userId", "==", user.uid));
        const workshopsSnapshot = await getDocs(userWorkshopsQuery);
        
        const deletePromises = workshopsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`${workshopsSnapshot.docs.length}개의 워크숍 데이터 삭제 완료`);

        // 3. Firestore에서 사용자 프로필 삭제
        const userRef = doc(db, 'users', user.uid);
        await deleteDoc(userRef);

        console.log("사용자 프로필 삭제 완료");

        // 4. localStorage에서 AI 동의 상태 삭제
        localStorage.removeItem('ai_disclosure_accepted');

        // 5. Firebase Authentication에서 사용자 계정 삭제
        await deleteUser(user);

        console.log("Firebase Authentication 계정 삭제 완료");

        // 6. localStorage 정리 (deviceId는 유지 - 재가입 시 추적 방지용)
        // deviceId는 유지하되, 다른 세션 정보는 정리
        localStorage.removeItem('ai_disclosure_accepted');

    } catch (error: any) {
        console.error("회원 탈퇴 중 오류 발생:", error);
        
        // 에러 메시지 개선
        if (error.code === 'auth/requires-recent-login') {
            throw new Error(
                "보안을 위해 재로그인이 필요합니다.\n\n" +
                "로그아웃 후 다시 로그인한 뒤 탈퇴를 진행해 주세요."
            );
        } else if (error.code === 'permission-denied') {
            throw new Error(
                "데이터 삭제 권한이 없습니다.\n\n" +
                "잠시 후 다시 시도해 주세요."
            );
        } else {
            throw new Error(
                `회원 탈퇴 처리 중 오류가 발생했습니다.\n\n` +
                `오류 내용: ${error.message}\n\n` +
                `계속 문제가 발생하면 고객 지원팀에 문의해 주세요.`
            );
        }
    }
};

// --- Firestore ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
};

export const saveWorkshop = async (workshopData: WorkshopData): Promise<string> => {
    if (!auth.currentUser) {
        throw new Error("로그인이 필요합니다. 워크숍을 저장하려면 먼저 로그인해 주세요.");
    }

    const workshopsColRef = collection(db, "workshops");
    const newWorkshopRef = doc(workshopsColRef);

    try {
        await setDoc(newWorkshopRef, {
            ...workshopData,
            id: newWorkshopRef.id,
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser?.email,
            createdAt: serverTimestamp()
        });

        return newWorkshopRef.id;
    } catch (e) {
        console.error("Save workshop failed: ", e);
        const error = e as Error;
        if (error.message?.includes('permission')) {
            throw new Error("워크숍 저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
        }
        if (error.message?.includes('network') || error.message?.includes('unavailable')) {
            throw new Error("네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.");
        }
        throw new Error("워크숍 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
};

export const getUserWorkshops = async (userId: string): Promise<WorkshopDocument[]> => {
    const workshopsRef = collection(db, "workshops");
    const q = query(workshopsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkshopDocument));
};

export const getWorkshopById = async (workshopId: string): Promise<WorkshopDocument | null> => {
    const workshopRef = doc(db, "workshops", workshopId);
    const workshopDoc = await getDoc(workshopRef);
    if (workshopDoc.exists()) {
        return { id: workshopDoc.id, ...workshopDoc.data() } as WorkshopDocument;
    }
    return null;
};

export const getAllWorkshops = async (): Promise<WorkshopDocument[]> => {
    const workshopsRef = collection(db, "workshops");
    const q = query(workshopsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkshopDocument));
};

export const saveWorkshopFeedback = async (feedback: Omit<WorkshopFeedback, 'workshopId' | 'userId' | 'createdAt'>, workshopId: string): Promise<void> => {
    if (!auth.currentUser) {
        throw new Error("로그인이 필요합니다.");
    }

    const feedbacksColRef = collection(db, "workshopFeedbacks");
    const newFeedbackRef = doc(feedbacksColRef);

    try {
        await setDoc(newFeedbackRef, {
            ...feedback,
            workshopId,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Save feedback failed: ", e);
        throw new Error("피드백 저장에 실패했습니다.");
    }
};

export const getWorkshopFeedbacks = async (workshopId: string): Promise<WorkshopFeedback[]> => {
    const feedbacksRef = collection(db, "workshopFeedbacks");
    const q = query(feedbacksRef, where("workshopId", "==", workshopId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
        } as WorkshopFeedback;
    });
};

export const saveWorkshopAsTemplate = async (workshopId: string, templateName: string): Promise<string> => {
    if (!auth.currentUser) {
        throw new Error("로그인이 필요합니다.");
    }

    // 기존 워크숍 가져오기
    const workshopRef = doc(db, "workshops", workshopId);
    const workshopDoc = await getDoc(workshopRef);
    
    if (!workshopDoc.exists()) {
        throw new Error("워크숍을 찾을 수 없습니다.");
    }

    const workshopData = workshopDoc.data() as WorkshopDocument;
    
    // 템플릿으로 저장
    const templatesColRef = collection(db, "templates");
    const newTemplateRef = doc(templatesColRef);

    try {
        await setDoc(newTemplateRef, {
            name: templateName,
            workshopData: {
                purpose: workshopData.purpose,
                product: workshopData.product,
                participantsInfo: workshopData.participantsInfo,
                workshopType: workshopData.workshopType,
                duration: workshopData.duration,
                participants: workshopData.participants,
                flipchartAvailable: workshopData.flipchartAvailable,
                plan: workshopData.plan,
                analysis: workshopData.analysis,
            },
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser?.email,
            createdAt: serverTimestamp()
        });

        return newTemplateRef.id;
    } catch (e) {
        console.error("Save template failed: ", e);
        const error = e as Error;
        if (error.message?.includes('permission')) {
            throw new Error("템플릿 저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
        }
        throw new Error("템플릿 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
};

export const getUserTemplates = async (userId: string): Promise<WorkshopTemplate[]> => {
    const templatesRef = collection(db, "templates");
    const q = query(templatesRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkshopTemplate));
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
    if (!auth.currentUser) {
        throw new Error("로그인이 필요합니다.");
    }

    const templateRef = doc(db, "templates", templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (!templateDoc.exists()) {
        throw new Error("템플릿을 찾을 수 없습니다.");
    }

    const templateData = templateDoc.data();
    if (templateData.userId !== auth.currentUser.uid) {
        throw new Error("템플릿을 삭제할 권한이 없습니다.");
    }

    await deleteDoc(templateRef);
};

export const deleteWorkshop = async (workshopId: string): Promise<void> => {
    if (!auth.currentUser) {
        throw new Error("로그인이 필요합니다.");
    }

    const workshopRef = doc(db, "workshops", workshopId);
    const workshopDoc = await getDoc(workshopRef);
    
    if (!workshopDoc.exists()) {
        throw new Error("워크숍을 찾을 수 없습니다.");
    }

    const workshopData = workshopDoc.data();
    if (workshopData.userId !== auth.currentUser.uid) {
        throw new Error("워크숍을 삭제할 권한이 없습니다.");
    }

    await deleteDoc(workshopRef);
};

// Fix: Add addUserCredits function to handle credit updates.
export const addUserCredits = async (userId: string, creditsToAdd: number): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        credits: increment(creditsToAdd)
    });
};