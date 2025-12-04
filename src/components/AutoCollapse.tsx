import { useEffect, useRef } from "react";

type AutoCollapseProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: number;
};

export function AutoCollapse({
  isOpen,
  children,
  duration = 250
}: AutoCollapseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<boolean>(isOpen);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // prevent unwanted animations
    if (prev.current === isOpen) return; 
    prev.current = isOpen;


    el.style.transition = "none";

    if (isOpen) {
      // expand
      const target = el.scrollHeight;
      el.style.height = "0px";
      el.style.opacity = "0";
      el.style.overflow = "hidden";

      // force apply pending style
      void el.offsetHeight; 

      el.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
      el.style.height = `${target}px`;
      el.style.opacity = "1";

      const clear = () => {
        el.style.height = "auto";
        el.style.overflow = "visible";
        el.removeEventListener("transitionend", clear);
      };
      el.addEventListener("transitionend", clear);
    } else {
      // collapse
      const start = el.scrollHeight;
      el.style.height = `${start}px`;
      el.style.opacity = "1";
      el.style.overflow = "hidden";

      // force apply pending style
      void el.offsetHeight; 

      el.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
      el.style.height = "0px";
      el.style.opacity = "0";
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={ref}
      style={{ height: isOpen ? "auto" : "0px", opacity: isOpen ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
