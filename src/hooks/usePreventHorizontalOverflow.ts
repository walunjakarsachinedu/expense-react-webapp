import { RefObject, useCallback, useEffect } from "react";

/**
 * Prevents an element from overflowing the horizontal edges of the viewport
 * by applying a `translateX` correction.
 *
 * @param elementRef - Ref to the element to keep within the viewport.
 * @param deps - Additional dependencies that should re-trigger the overflow check (e.g. visibility state).
 * @param edgeDistance - Minimum gap in pixels to maintain from the viewport edges. Defaults to `12`.
 *
 * Right overflow takes priority over left: if both sides exceed the viewport,
 * the right edge correction is applied.
 */
export function usePreventHorizontalOverflow(
  elementRef: RefObject<HTMLElement | null | undefined>,
  deps: unknown[],
  edgeDistance: number = 12
) {
  const keepElementVisible = useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const style = window.getComputedStyle(elementRef.current);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const currentTranslateX = matrix.m41 ?? 0;

    const left = rect.left - currentTranslateX;
    const right = rect.right - currentTranslateX;

    let translateX = 0;

    if (right + edgeDistance > window.innerWidth) {
      translateX = window.innerWidth - right - edgeDistance;
    } else if (left - edgeDistance < 0) {
      translateX = edgeDistance - left;
    }

    elementRef.current.style.transform =
      translateX !== 0 ? `translateX(${translateX}px)` : "";
  }, [elementRef, edgeDistance]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => keepElementVisible(), 100);
    };

    window.addEventListener("resize", handleResize);
    keepElementVisible();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepElementVisible, ...deps]);
}