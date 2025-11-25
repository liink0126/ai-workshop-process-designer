import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
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
import type { UserProfile, WorkshopData, WorkshopDocument, WorkshopTemplate } from "../types";
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

export const googleSignIn = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, provider);
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
        if (error instanceof Error && error.message.includes('popup')) {
            throw new Error('로그인 팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해 주세요.');
        }
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