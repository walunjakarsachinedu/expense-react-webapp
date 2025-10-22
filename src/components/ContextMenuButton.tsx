import { ContextMenu } from "primereact/contextmenu";
import { MenuItem } from "primereact/menuitem";
import { useRef } from "react";
import "./ContextMenuButton.scss";

type Props = {
  items: MenuItem[];
};
const ContextMenuButton = ({ items }: Props) => {
  const cm = useRef<ContextMenu>(null);

  return (
    <div>
      <div
        className="mr-2 pi pi-bars icon-btn add-btn font-semibold"
        onClick={(e) => cm.current?.show(e)}
      ></div>

      <ContextMenu
        model={items}
        ref={cm}
        breakpoint="767px"
        style={{ background: "var(--dark-bg", scale: "0.9", width: "150px" }}
      />
    </div>
  );
};

export default ContextMenuButton;
