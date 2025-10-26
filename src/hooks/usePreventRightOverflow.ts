import { RefObject, useCallback, useEffect } from "react";

export function usePreventRightOverflow(extraInfoRef: RefObject<HTMLElement|null>, deps: unknown[]) {
      const keepExtraInfoVisible = useCallback(() => {
        if(!extraInfoRef.current) return;
        const rect = extraInfoRef.current.getBoundingClientRect();
        const style = window.getComputedStyle(extraInfoRef.current);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const currentTranslateX = matrix.m41 ?? 0; // X translation
        const right = rect.right - currentTranslateX; 
  
        if(right + 12 > window.innerWidth) {
          extraInfoRef.current.style.transform = `translateX(${window.innerWidth-right-12}px)`;
        }
        else {
          extraInfoRef.current.style.transform = ``;
        }
      }, [extraInfoRef]);
      
      useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        
        const handleResize = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => keepExtraInfoVisible(), 100);
        };
  
        window.addEventListener('resize', handleResize);
        keepExtraInfoVisible();
  
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('resize', handleResize);
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [keepExtraInfoVisible, ...deps]);
}