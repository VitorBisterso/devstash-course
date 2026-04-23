"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchDrawerContextValue {
  openItemId: string | null;
  setOpenItemId: (id: string | null) => void;
}

const SearchDrawerContext = createContext<SearchDrawerContextValue>({
  openItemId: null,
  setOpenItemId: () => {},
});

export function SearchDrawerProvider({ children }: { children: ReactNode }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  return (
    <SearchDrawerContext.Provider value={{ openItemId, setOpenItemId }}>
      {children}
    </SearchDrawerContext.Provider>
  );
}

export function useSearchDrawer() {
  return useContext(SearchDrawerContext);
}