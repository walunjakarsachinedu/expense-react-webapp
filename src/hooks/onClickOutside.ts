import { useEffect } from "react";

function useClickOutside(args: {ref: React.RefObject<HTMLElement|null>, onOutsideClick: () => unknown, active: boolean}): void {
  const { ref, onOutsideClick, active } = args; 
  useEffect(() => {
    if (!active) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onOutsideClick, active]);
}


export default useClickOutside;