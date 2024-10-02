import React, { useRef, useState, FocusEventHandler, KeyboardEventHandler, useEffect } from 'react';

interface EditableElemProps {
  placeHolder?: string;
  preventNewline?: boolean;
  numberOnly?: boolean;
  onFocus?: FocusEventHandler<HTMLSpanElement> | undefined;
  onBlur?: FocusEventHandler<HTMLSpanElement> | undefined;
  onKeyUp?: KeyboardEventHandler<HTMLSpanElement> | undefined;
  initialText?: string;
}

export default function EditableElem({ 
  numberOnly = false, 
  preventNewline = false,
  initialText = "", 
  placeHolder="", 
  onFocus, 
  onBlur, 
  onKeyUp, 
} :  EditableElemProps) {

  const contentRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<number|null>(null);
  const [state, setState] = useState<string>(initialText??"");

  useEffect(() => {
    if(!cursorRef.current || contentRef.current !== document.activeElement) return;
    _setCursorPosition(contentRef.current!, cursorRef.current);
  }, [state]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    var filteredContent = content;

    if(numberOnly) filteredContent = filteredContent.replace(/[^0-9]/g, "");
    if(preventNewline) filteredContent = filteredContent.replace(/\n/g, "");

    if (numberOnly || preventNewline) updateTextContent(e, filteredContent);
    setState(filteredContent);
  };

  function updateTextContent(e: React.FormEvent<HTMLDivElement>, filteredContent: string) {
    const content = e.currentTarget.textContent || "";
    const initialCursorPosition = _getCursorPosition(contentRef.current!);
    const initialLength = content!.length;

    e.currentTarget.textContent = filteredContent; 

    const afterLength = filteredContent.length;
    const dx = initialLength - afterLength;
    const newCursorPosition = initialCursorPosition-dx;

    _setCursorPosition(e.currentTarget, newCursorPosition);
    cursorRef.current = newCursorPosition;
  }

  return (
    <span 
      ref={contentRef}
      suppressContentEditableWarning={true}
      contentEditable={true}
      data-placeholder={placeHolder}
      onInput={handleInput}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      onBlur={onBlur}
      {...(preventNewline ? {onKeyDown: (event) => {
        if (event.key === 'Enter') event.preventDefault(); 
      } } : {})}
      {...(numberOnly ? { inputMode: 'decimal' } : {})}
    >{state}</span>
  );
};



function _getCursorPosition(element: HTMLElement) {
  const selection = document.getSelection()!;
  return selection!.anchorOffset;
}

function _setCursorPosition(element: HTMLElement, position: number) {
  if(element.childNodes.length === 0) return;

  const range = document.createRange();
  const selection = window.getSelection()!;
  
  range.setStart(element.childNodes[0], position);
  range.collapse(true);
  
  selection.removeAllRanges();
  selection.addRange(range);
}