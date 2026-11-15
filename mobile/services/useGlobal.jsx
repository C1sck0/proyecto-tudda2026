import { createContext, useContext, useState } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  return <GlobalContext.Provider
    value={{
      username, setUsername,
      role, setRole,
    }}
  >
    {children}
  </GlobalContext.Provider>;
}

export default function useGlobal() {
  return useContext(GlobalContext);
}