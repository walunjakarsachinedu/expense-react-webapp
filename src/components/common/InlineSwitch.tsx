import { Button } from "primereact/button";

type Props = {
  selectedValue?: string;
  values: { key: string; label: string }[];
  onSelect?: (value: string) => void;
  className?: string;
};

export default function InlineSwitch({ values, selectedValue, onSelect, className }: Props) {
  if (!values.length) return null;

  const index = Math.max(
    selectedValue
      ? values.findIndex(v => v.key === selectedValue)
      : 0,
    0
  );

  const nextIdx = (index + 1) % values.length;

  return (
    <Button
      className="ml-2 mt-0"
      style={{padding: "6px 8px"}}
      outlined
      size="small"
      onClick={() => onSelect?.(values[nextIdx].key)}
    >
      {values[nextIdx].label}
    </Button>
    
    // <div
    //   onClick={() => onSelect?.(values[nextIdx].key)}
    //   className={`InlineSwitch px-2 cursor-pointer underline text-primary-500 hover:text-primary-300 hover:no-underline transition-colors ${className}`}
    // >
    //   {values[nextIdx].label}
    // </div>
  );
}
