import React from 'react';
import { MissionsContext, useMissionsLogic } from '../../hooks/useMissions';

interface MissionsProviderProps {
  children: React.ReactNode;
}

export default function MissionsProvider({ children }: MissionsProviderProps) {
  const missions = useMissionsLogic();

  return (
    <MissionsContext.Provider value={missions}>
      {children}
    </MissionsContext.Provider>
  );
}