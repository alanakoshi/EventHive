import { createContext, useState } from 'react';

export const CohostContext = createContext();

export const CohostProvider = ({ children }) => {
  const [cohosts, setCohosts] = useState([]);
  
  return (
    <CohostContext.Provider value={{ cohosts, setCohosts }}>
      {children}
    </CohostContext.Provider>
  );
};
