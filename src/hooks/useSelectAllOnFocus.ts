import { useEffect } from 'react';

/** select all text on focus. */
export function useSelectAllOnFocus(ref: React.RefObject<HTMLDivElement | null>, enabled = false) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    const handleFocus = () => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    element.addEventListener('focus', handleFocus);
    return () => element.removeEventListener('focus', handleFocus);
  }, [ref, enabled]);
}
