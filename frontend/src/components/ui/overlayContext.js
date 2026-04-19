import { createContext, useContext } from 'react';

export const OverlayContext = createContext(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay must be used within <OverlayProvider>');
  return ctx;
}

