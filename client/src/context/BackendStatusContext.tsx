import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BackendStatusContextType {
  isWakingUp: boolean;
  isOnline: boolean;
  lastChecked: Date | null;
  checkStatus: () => Promise<boolean>;
}

const BackendStatusContext = createContext<BackendStatusContextType>({
  isWakingUp: false,
  isOnline: true,
  lastChecked: null,
  checkStatus: async () => true,
});

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async (): Promise<boolean> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch('/api/health', {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsWakingUp(false);
        setIsOnline(true);
        setLastChecked(new Date());
        return true;
      } else {
        setIsWakingUp(true);
        setIsOnline(false);
        setLastChecked(new Date());
        return false;
      }
    } catch {
      clearTimeout(timeoutId);
      setIsWakingUp(true);
      setIsOnline(false);
      setLastChecked(new Date());
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkStatus();

    // Periodic background check if server is waking up
    let interval: NodeJS.Timeout | null = null;
    if (isWakingUp) {
      interval = setInterval(() => {
        checkStatus();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWakingUp, checkStatus]);

  return (
    <BackendStatusContext.Provider value={{ isWakingUp, isOnline, lastChecked, checkStatus }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => useContext(BackendStatusContext);
