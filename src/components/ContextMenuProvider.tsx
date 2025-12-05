import { createContext, useRef, useState, ReactNode, SyntheticEvent } from "react";
import { ContextMenu } from "primereact/contextmenu";
import type { MenuItem } from "primereact/menuitem";

type CtxMenu = {
  showCtxMenu: (e: SyntheticEvent, items: MenuItem[]) => void;
};

const CMContext = createContext<CtxMenu>({
  showCtxMenu: () => {}
});

export { CMContext };

export const ContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const cm = useRef<ContextMenu>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const showCtxMenu = (e: SyntheticEvent, items: MenuItem[]) => {
    setMenuItems(items);        
    cm.current?.show(e);
  };

  return (
    <CMContext.Provider value={{ showCtxMenu }}>
      {children}
      <ContextMenu
        model={menuItems}
        ref={cm}
        breakpoint="767px"
        style={{ background: "var(--context-menu-bg-color)", scale: "0.9", width: "150px" }}
      />
    </CMContext.Provider>
  );
};
