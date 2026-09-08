import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadIptvCatalog } from '@workspace/api-client-react';
import type { IptvCatalogResponse } from '@workspace/api-client-react';
import { channels, type Channel } from '@/constants/catalog';

type Account = {
  label: string;
  host: string;
  username: string;
  password: string;
  expiresAt: string;
};

type PlayerContextValue = {
  account: Account | null;
  favorites: string[];
  playbackProgress: Record<string, number>;
  availableChannels: Channel[];
  remoteCatalog: IptvCatalogResponse | null;
  isSyncing: boolean;
  catalogError: string | null;
  recentChannel: string;
  isReady: boolean;
  connectAccount: (input: { host: string; username: string; password: string; label?: string; expiresAt?: string }) => Promise<void>;
  refreshCatalog: () => Promise<IptvCatalogResponse | null>;
  disconnectAccount: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  getProgress: (id: string) => number;
  saveProgress: (id: string, position: number) => Promise<void>;
};

const STORAGE_KEY = '@streamora-player-state';
const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['sports-1', 'cinema-1']);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const playbackProgressRef = useRef<Record<string, number>>({});
  const [remoteCatalog, setRemoteCatalog] = useState<IptvCatalogResponse | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    playbackProgressRef.current = playbackProgress;
  }, [playbackProgress]);

  const syncCatalog = useCallback(async (nextAccount: Account) => {
    setIsSyncing(true);
    setCatalogError(null);
    try {
      const catalog = await loadIptvCatalog({
        host: nextAccount.host,
        username: nextAccount.username,
        password: nextAccount.password,
      });
      setRemoteCatalog(catalog);
      return catalog;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر تحديث القنوات.';
      setCatalogError(message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const persist = async (
    nextAccount: Account | null,
    nextFavorites: string[],
    nextPlaybackProgress = playbackProgress,
    nextCatalog = remoteCatalog,
  ) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      account: nextAccount,
      favorites: nextFavorites,
      playbackProgress: nextPlaybackProgress,
      catalog: nextCatalog,
    }));
  };

  const connectAccount = async (input: { host: string; username: string; password: string; label?: string; expiresAt?: string }) => {
    const host = input.host.trim().replace(/\/$/, '');
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 365);
    const nextAccount: Account = {
      host,
      username: input.username.trim(),
      password: input.password,
      label: input.label?.trim() || 'اشتراكي الرئيسي',
      expiresAt: input.expiresAt || formatDate(defaultExpiry),
    };
    const nextCatalog = await syncCatalog(nextAccount);
    const catalogExpiry = nextCatalog.expiresAt || nextAccount.expiresAt;
    const accountWithExpiry = { ...nextAccount, expiresAt: catalogExpiry };
    setAccount(accountWithExpiry);
    await persist(accountWithExpiry, favorites, playbackProgress, nextCatalog);
  };

  const disconnectAccount = async () => {
    setAccount(null);
    setRemoteCatalog(null);
    setCatalogError(null);
    await persist(null, favorites, playbackProgress, null);
  };

  const toggleFavorite = async (id: string) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id];
    setFavorites(nextFavorites);
    await persist(account, nextFavorites, playbackProgress);
  };

  const saveProgress = useCallback(async (id: string, position: number) => {
    const safePosition = Math.max(0, Math.min(100, Math.round(position)));
    const nextProgress = { ...playbackProgressRef.current, [id]: safePosition };
    playbackProgressRef.current = nextProgress;
    setPlaybackProgress(nextProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      account,
      favorites,
      playbackProgress: nextProgress,
      catalog: remoteCatalog,
    }));
  }, [account, favorites, remoteCatalog]);

  const refreshCatalog = useCallback(async () => {
    if (!account) return null;
    return syncCatalog(account);
  }, [account, syncCatalog]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || cancelled) return;
        const parsed = JSON.parse(stored) as {
          account?: Account | null;
          favorites?: string[];
          playbackProgress?: Record<string, number>;
          catalog?: IptvCatalogResponse | null;
        };
        if (parsed.account) {
          setAccount(parsed.account);
          if (parsed.account.password) {
            void syncCatalog(parsed.account).catch(() => undefined);
          }
        }
        if (parsed.favorites) setFavorites(parsed.favorites);
        if (parsed.catalog) setRemoteCatalog(parsed.catalog);
        if (parsed.playbackProgress) {
          playbackProgressRef.current = parsed.playbackProgress;
          setPlaybackProgress(parsed.playbackProgress);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [syncCatalog]);

  const availableChannels = remoteCatalog?.live?.length ? remoteCatalog.live : channels;

  const value = useMemo<PlayerContextValue>(() => ({
    account,
    favorites,
    playbackProgress,
    availableChannels,
    remoteCatalog,
    isSyncing,
    catalogError,
    recentChannel: channels[0].id,
    isReady,
    connectAccount,
    refreshCatalog,
    disconnectAccount,
    toggleFavorite,
    isFavorite: (id: string) => favorites.includes(id),
    getProgress: (id: string) => playbackProgress[id] || 0,
    saveProgress,
  }), [account, availableChannels, catalogError, favorites, isReady, isSyncing, playbackProgress, refreshCatalog, remoteCatalog, saveProgress]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error('usePlayer must be used inside PlayerProvider');
  return value;
}

export function getRemainingDays(expiresAt: string) {
  const [year, month, day] = expiresAt.replace(/-/g, '/').split('/').map(Number);
  const expiry = new Date(year, month - 1, day, 23, 59, 59);
  if (Number.isNaN(expiry.getTime())) return 0;
  const millisecondsRemaining = expiry.getTime() - Date.now();
  return Math.max(0, Math.ceil(millisecondsRemaining / 86_400_000));
}

export function formatExpiryDate(expiresAt: string) {
  const [year, month, day] = expiresAt.replace(/-/g, '/').split('/');
  return `${day}/${month}/${year}`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}