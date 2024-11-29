import { ContextMenu } from "primereact/contextmenu";
import { MenuItem } from "primereact/menuitem";
import { useRef } from "react";

type Props = {
  items: MenuItem[];
};
const SimpleContextMenu = ({ items }: Props) => {
  const cm = useRef<ContextMenu>(null);

  return (
    <div>
      <div
        className="mr-2 pi pi-bars icon-btn add-btn"
        onClick={(e) => cm.current?.show(e)}
      ></div>

      <ContextMenu
        model={items}
        ref={cm}
        breakpoint="767px"
        style={{ background: "var(--dark-bg" }}
      />
    </div>
  );
};

export default SimpleContextMenu;
