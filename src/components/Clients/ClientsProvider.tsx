import React from 'react';
import { ClientsContext, useClientsLogic } from '../../hooks/useClients';

interface ClientsProviderProps {
  children: React.ReactNode;
}

export default function ClientsProvider({ children }: ClientsProviderProps) {
  const clients = useClientsLogic();

  return (
    <ClientsContext.Provider value={clients}>
      {children}
    </ClientsContext.Provider>
  );
}