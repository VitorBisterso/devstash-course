"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ItemDrawer } from "./item-drawer";

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
  return (
    <ItemDrawerControllerInner>
      {children}
    </ItemDrawerControllerInner>
  );
}

function ItemDrawerControllerInner({ children }: ItemDrawerControllerProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const handleItemClick = (itemId: string) => {
    setOpenItemId(itemId);
  };

  const handleClose = () => {
    setOpenItemId(null);
  };

  return (
    <DrawerContext.Provider value={{ onItemClick: handleItemClick }}>
      {children}
      <ItemDrawer itemId={openItemId} onClose={handleClose} />
    </DrawerContext.Provider>
  );
}

export function useItemDrawer() {
  return useContext(DrawerContext);
}
