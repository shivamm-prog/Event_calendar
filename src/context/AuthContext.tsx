import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AvenueOfService, UserProfile, UserRole } from '../types/rotaract';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isCoreTeam: boolean;
  isBOD: boolean;
  assignedAvenue?: AvenueOfService;
  canManageAvenue: (avenue: AvenueOfService) => boolean;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  quickLoginDemo: (role: 'core' | 'bod', avenue?: AvenueOfService) => Promise<void>;
  refreshProfile: () => Promise<void>;
  simulatedRole: UserRole | null;
  simulatedAvenue: AvenueOfService | null;
  setSimulatedRole: (role: UserRole | null, avenue?: AvenueOfService | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(null);
  const [simulatedAvenue, setSimulatedAvenueState] = useState<AvenueOfService | null>(null);

  const setSimulatedRole = (role: UserRole | null, avenue?: AvenueOfService | null) => {
    setSimulatedRoleState(role);
    setSimulatedAvenueState(avenue || null);
  };

  // Load or initialize user profile in Firestore
  const fetchOrInitProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || data.email || '',
          displayName: user.displayName || data.displayName || 'Club Member',
          role: data.role as UserRole,
          assignedAvenue: data.assignedAvenue as AvenueOfService | undefined,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        };
        setUserProfile(profile);
        return profile;
      }

      // Check if this is the first user in the system or designated admin email
      let isFirstUser = false;
      try {
        const usersQuery = query(collection(db, 'users'), limit(2));
        const usersSnap = await getDocs(usersQuery);
        isFirstUser = usersSnap.empty;
      } catch {
        isFirstUser = true;
      }

      const isAdminEmail =
        user.email?.toLowerCase().includes('core') ||
        user.email?.toLowerCase().includes('admin') ||
        user.email?.toLowerCase().includes('president') ||
        user.email?.toLowerCase() === 'shivamlabhshetwar0@gmail.com';

      const initialRole: UserRole = isFirstUser || isAdminEmail ? 'core_team' : 'bod';
      const initialAvenue: AvenueOfService | undefined =
        initialRole === 'bod' ? 'Community Service' : undefined;

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Club Member',
        role: initialRole,
        assignedAvenue: initialAvenue,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error fetching or initializing user profile:', err);
      // Fallback in memory
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Club Member',
        role: 'bod',
        assignedAvenue: 'Community Service',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrInitProfile(user);
      } else {
        setUserProfile(null);
        setSimulatedRoleState(null);
        setSimulatedAvenueState(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    await fetchOrInitProfile(cred.user);
  };

  const signIn = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await fetchOrInitProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-in is disabled in your Firebase console. Please click "Sign In with Google", which is pre-configured and active.'
        );
      }
      throw err;
    }
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await fetchOrInitProfile(cred.user);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-up is disabled in your Firebase console. Please click "Sign In with Google", which is pre-configured and active.'
        );
      }
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setSimulatedRoleState(null);
    setSimulatedAvenueState(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrInitProfile(currentUser);
    }
  };

  // Helper for quick demo/testing logins so testers can test Core Team vs BOD instantly
  const quickLoginDemo = async (role: 'core' | 'bod', avenue: AvenueOfService = 'Community Service') => {
    const demoEmail = role === 'core' ? 'coreteam.admin@rscoe.ac.in' : 'bod.director@rscoe.ac.in';
    const demoPass = 'RotaractRSCOE@2026';

    try {
      await signIn(demoEmail, demoPass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('disabled')) {
        throw new Error(
          'Email/Password authentication is disabled in this Firebase project. Please click "Sign In with Google" above. Once logged in, you can switch roles or manage members!'
        );
      }
      // If user doesn't exist yet, create it
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          const name = role === 'core' ? 'Core Team Administrator' : `BOD Director (${avenue})`;
          await updateProfile(cred.user, { displayName: name });
          const userRef = doc(db, 'users', cred.user.uid);
          const profileData: UserProfile = {
            uid: cred.user.uid,
            email: demoEmail,
            displayName: name,
            role: role === 'core' ? 'core_team' : 'bod',
            assignedAvenue: role === 'bod' ? avenue : undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await setDoc(userRef, profileData);
          setUserProfile(profileData);
        } catch (createErr: any) {
          if (createErr.code === 'auth/operation-not-allowed' || createErr.message?.includes('disabled')) {
            throw new Error(
              'Email/Password authentication is disabled in this Firebase project. Please click "Sign In with Google" above.'
            );
          }
          throw createErr;
        }
      } else {
        throw err;
      }
    }
  };

  const activeRole = simulatedRole || userProfile?.role;
  const isCoreTeam = activeRole === 'core_team';
  const isBOD = activeRole === 'bod';
  const assignedAvenue =
    simulatedRole === 'bod'
      ? (simulatedAvenue || userProfile?.assignedAvenue || 'Community Service')
      : userProfile?.assignedAvenue;

  // Check whether current user can create, edit, or delete events in a given avenue
  const canManageAvenue = (avenue: AvenueOfService): boolean => {
    if (!userProfile) return false;
    if (activeRole === 'core_team') return true;
    if (activeRole === 'bod' && assignedAvenue === avenue) return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isCoreTeam,
        isBOD,
        assignedAvenue,
        canManageAvenue,
        signInWithGoogle,
        signIn,
        signUp,
        signOut,
        quickLoginDemo,
        refreshProfile,
        simulatedRole,
        simulatedAvenue,
        setSimulatedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
