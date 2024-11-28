import { useRef, useState } from "react";

type Props = {
  initialText: string;
  placeHolder: string;
  onChange?: (value: string) => void;
};

const SimpleContentEditable = ({
  initialText,
  placeHolder,
  onChange,
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [state] = useState<string>(initialText ?? "");

  const handleInput = () => {
    if (onChange && contentRef.current) {
      onChange(contentRef.current.innerText);
    }
  };

  return (
    <span
      ref={contentRef}
      onInput={handleInput}
      suppressContentEditableWarning
      contentEditable="true"
      className="editable"
      data-placeholder={placeHolder}
    >
      {state}
    </span>
  );
};

export default SimpleContentEditable;
