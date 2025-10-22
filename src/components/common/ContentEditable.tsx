import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import './ContentEditable.scss';

type Props = {
  onChange?: (text: string) => void;
  placeHolder?: string;
};

function ContentEditable({ onChange, placeHolder = "" }: Props) {
  const [content, setContent] = useState("");
  const elRef = useRef<HTMLSpanElement>(null);

  const getContent = useCallback((el: HTMLElement) => {
    const html = el.innerHTML;
    return html
      .replace(/<div><br><\/div>/g, '\n')
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/<br>/g, '\n');
  }, []);

  const setPlaceholder = useCallback((el: HTMLElement) => {
    if (content === "") el.setAttribute("data-placeholder", placeHolder);
    else el.removeAttribute("data-placeholder");
  }, [content, placeHolder]);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    setPlaceholder(el);
  }, [setPlaceholder]);

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const value = getContent(e.currentTarget);
    setContent(value);
    onChange?.(value);
  };

  // only update innerHTML when content changes externally
  useLayoutEffect(() => {
    const el = elRef.current;
    const html = content
      .replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<br>');
    if (el && el.innerHTML !== html) {
      el.innerText = content;
    }
  }, [content]);

  return (
    <span
      ref={elRef}
      style={{ display: "inline-block", width: "100%" }}
      contentEditable
      suppressContentEditableWarning
      className="ContentEditable"
      onInput={handleInput}
    />
  );
}

export default ContentEditable;
