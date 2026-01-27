import React, {
  useRef,
  useState,
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect,
} from "react";
import { useSelectAllOnFocus } from "../../hooks/useSelectAllOnFocus";

interface Props {
  placeHolder?: string;
  preventNewline?: boolean;
  trimInput?: boolean;
  numberOnly?: boolean;
  /** in numberOnly mode, maximum limit on number. */
  maxNumber?: number;
  maxCharacter?: number;
  isReadonly?: boolean;
  onFocus?: FocusEventHandler<HTMLSpanElement> | undefined;
  onBlur?: FocusEventHandler<HTMLSpanElement> | undefined;
  onKeyUp?: KeyboardEventHandler<HTMLSpanElement> | undefined;
  onChange?: (value: string) => void;

  initialText?: string;
  className?: string;
  /** select all text on focus of input. */
  selectAllOnFocus?: boolean;
  /** extra spacing to keep element above the on-screen keyboard */
  keyboardOffset?: number; 
}

export default function EditableElem({
  numberOnly = false,
  maxNumber,
  preventNewline = false,
  trimInput = false,
  maxCharacter,
  initialText = "",
  placeHolder = "",
  className = "",
  isReadonly = false,
  selectAllOnFocus,
  keyboardOffset,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<number | null>(null);
  const [textState, setState] = useState<string>(initialText ?? "");

  useSelectAllOnFocus(contentRef, selectAllOnFocus);

  // use to trigger re-render when value of initialText change
  useEffect(() => {
    setState(initialText ?? "");
  }, [initialText]);

  useEffect(() => {
    if (!cursorRef.current || contentRef.current !== document.activeElement)
      return;
    _setCursorPosition(contentRef.current!, cursorRef.current);
  }, [textState]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    const filteredContent = applyFilters(content);

    if (numberOnly || preventNewline || maxCharacter || trimInput) {
      updateTextContent(e, filteredContent);
    }
    onChange?.(e.currentTarget.textContent ?? "");
    setState(filteredContent);
  };

  const applyFilters = (str: string) => {
    if (numberOnly) {
      str = str.replace(/[^0-9]/g, "");
      if(maxNumber && str.length) {
        let num = Number(str);
        while (str.length && num > maxNumber) {
          const str = num.toString();
          num = Number(str.slice(1));
        }
        str = num.toString();
      }
    }
    if (preventNewline) str = str.replace(/\n/g, "");
    if (maxCharacter && str.length > maxCharacter) {
      str = textState;
    }
    return str;
  };

  /**
   * updates the content of a contenteditable element and restores the cursor position
   */
  function updateTextContent(
    e: React.FormEvent<HTMLDivElement>,
    filteredContent: string
  ) {
    const content = e.currentTarget.textContent || "";
    const initialCursorPosition = _getCursorPosition(contentRef.current!);
    const initialLength = content!.length;

    e.currentTarget.textContent = filteredContent;

    const afterLength = filteredContent.length;
    const dx = initialLength - afterLength;
    const newCursorPosition = initialCursorPosition - dx;

    _setCursorPosition(e.currentTarget, newCursorPosition);
    cursorRef.current = newCursorPosition;
  }

  const handleOnBlur = (e: React.FocusEvent<HTMLSpanElement, Element>) => {
    if (trimInput && e.currentTarget.textContent) {
      e.currentTarget.textContent = e.currentTarget.textContent?.trim();
    }
    onBlur?.(e);
  };

  const scrollElementAboveKeyboard = (el: HTMLElement, offsetFromKeyboard: number = 50) => {
    const vv = window.visualViewport;
    if (!vv) return;

    const rect = el.getBoundingClientRect();

    const visibleBottom = vv.offsetTop + vv.height;
    const desiredBottom = visibleBottom - offsetFromKeyboard; 

    // already visible, so skipping scrolling
    if (rect.bottom <= desiredBottom) return;

    const delta = rect.bottom - desiredBottom;

    window.scrollBy({
      top: delta,
      behavior: "smooth",
    });
  };


  const handleOnFocus = (e: React.FocusEvent<HTMLSpanElement, Element>) => {
    onFocus?.(e);
    setTimeout(() => {
      const el = contentRef.current;
      if (!el) return;
      scrollElementAboveKeyboard(el, keyboardOffset);
    }, 300);
  };

  return (
    <span
      ref={contentRef}
      suppressContentEditableWarning={true}
      contentEditable={!isReadonly}
      data-placeholder={placeHolder}
      onInput={handleInput}
      onKeyUp={onKeyUp}
      onFocus={handleOnFocus}
      className={`editable ${className}`}
      onBlur={handleOnBlur}
      {...(preventNewline
        ? {
            onKeyDown: (event) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }
        : {})}
      {...(numberOnly ? { inputMode: "decimal" } : {})}
    >
      {textState}
    </span>
  );
}

function _getCursorPosition(element: HTMLElement) {
  const selection = document.getSelection()!;
  return selection!.anchorOffset;
}

function _setCursorPosition(element: HTMLElement, position: number) {
  if (element.childNodes.length === 0) return;

  const textNode = element.childNodes[0];
  const textLength = textNode.textContent?.length ?? 0;
  const safePosition = Math.min(position, textLength);

  const range = document.createRange();
  const selection = window.getSelection()!;

  range.setStart(element.childNodes[0], safePosition);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}
