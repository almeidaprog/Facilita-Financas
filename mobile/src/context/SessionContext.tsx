import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { User } from '@/services/types';

const STORAGE_KEY = '@facilita:user';

type SessionValue = {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (saved) => {
        if (!active || !saved) return;
        try {
          const parsed = JSON.parse(saved) as User;
          if (parsed && Number.isFinite(Number(parsed.id)) && parsed.name && parsed.email) {
            setUser({ ...parsed, id: Number(parsed.id) });
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionValue>(() => ({
    user,
    loading,
    signIn: async (nextUser) => {
      // Persiste primeiro para não deixar a interface autenticada com uma sessão que não foi salva.
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    signOut: async () => {
      // Mesmo que o armazenamento falhe, a sessão atual precisa sair da interface.
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setUser(null);
      }
    },
  }), [user, loading]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession precisa estar dentro de SessionProvider.');
  return value;
}
