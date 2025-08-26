import React, { createContext, useContext, useState, useCallback } from 'react';

export type SwipeTabsConfig = {
  enabled: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  excludeFromY?: number;
  dxThreshold?: number;
  vxThreshold?: number;
};

type Ctx = {
  config: SwipeTabsConfig;
  setConfig: (cfg: SwipeTabsConfig) => void;
};

const defaultConfig: SwipeTabsConfig = { enabled: false };

const SwipeTabsContext = createContext<Ctx>({ config: defaultConfig, setConfig: () => {} });

export function SwipeTabsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SwipeTabsConfig>(defaultConfig);
  const setConfig = useCallback((cfg: SwipeTabsConfig) => setConfigState(cfg), []);
  return (
    <SwipeTabsContext.Provider value={{ config, setConfig }}>
      {children}
    </SwipeTabsContext.Provider>
  );
}

export function useSwipeTabsContext() {
  return useContext(SwipeTabsContext);
}

export function useSwipeTabs(initial?: Omit<SwipeTabsConfig, 'enabled'> & { enabled?: boolean }) {
  const { config, setConfig } = useSwipeTabsContext();
  React.useEffect(() => {
    const next: SwipeTabsConfig = {
      enabled: initial?.enabled ?? true,
      onNext: initial?.onNext,
      onPrev: initial?.onPrev,
      excludeFromY: initial?.excludeFromY,
      dxThreshold: initial?.dxThreshold,
      vxThreshold: initial?.vxThreshold,
    };
    setConfig(next);
    return () => setConfig({ enabled: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.onNext, initial?.onPrev, initial?.enabled, initial?.dxThreshold, initial?.vxThreshold, initial?.excludeFromY]);

  const update = React.useCallback((partial: Partial<SwipeTabsConfig>) => {
    setConfig({ ...config, ...partial, enabled: partial.enabled ?? config.enabled });
  }, [config, setConfig]);

  return { update };
}
