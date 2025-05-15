'use client';

import { createContext, useContext, useState } from 'react';
import { ReactNode } from 'react';

const SharedContext = createContext<any>(null);


export function useShared() {
  return useContext(SharedContext);
}


interface SharedProviderProps {
  children: ReactNode; 
}

export function ContentProvider({ children }: SharedProviderProps) {
  const [sharedValue, setSharedValue] = useState<string>("00000000-0000-0000-0000-000000000000")

    
  return (
    <SharedContext.Provider value={{ sharedValue, setSharedValue }}>
      {children}
      
    </SharedContext.Provider>
  );
}