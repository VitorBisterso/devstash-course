"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ItemDrawer } from "./item-drawer";
import { useSearchDrawer } from "./search-drawer-context";

interface ItemDrawerControllerProps {
  children: ReactNode;
}

interface DrawerContextValue {
  onItemClick: (itemId: string) => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  onItemClick: () => {},
});

export function ItemDrawerController({ children }: ItemDrawerControllerProps) {
  const [internalOpenItemId, setInternalOpenItemId] = useState<string | null>(null);
  const { openItemId, setOpenItemId: setContextOpenItemId } = useSearchDrawer();

  const effectiveItemId = internalOpenItemId ?? openItemId;

  const handleItemClick = (itemId: string) => {
    setInternalOpenItemId(itemId);
    setContextOpenItemId(null);
  };

  const handleClose = () => {
    setInternalOpenItemId(null);
    setContextOpenItemId(null);
  };

  return (
    <DrawerContext.Provider value={{ onItemClick: handleItemClick }}>
      {children}
      <ItemDrawer itemId={effectiveItemId} onClose={handleClose} />
    </DrawerContext.Provider>
  );
}

export function useItemDrawer() {
  return useContext(DrawerContext);
}
