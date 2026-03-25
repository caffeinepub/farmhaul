import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface AuthContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (p: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!actor) return;
    try {
      const p = await actor.getCallerUserProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (isFetching) return;
    if (!actor) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    actor
      .getCallerUserProfile()
      .then((p) => setProfile(p))
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [actor, isFetching]);

  return (
    <AuthContext.Provider
      value={{ profile, isLoading, setProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
