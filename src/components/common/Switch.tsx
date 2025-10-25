import './Switch.scss';

type Props = {
  selectedValue?: string;
  values: string[];
  onSelect?: (value: string) => void;
  className?: string;
}
export default function Switch({ values, selectedValue, onSelect, className }: Props) {
  return (
    <div className={`Switch inline-flex p-2 ${className}`}>
      {values.map((value) =>
        <div key={value} 
          className={'px-2 cursor-pointer ' + (value == selectedValue ? 'highlight-bg' : '')} 
          onClick={() => onSelect?.(value)}
        >
          {value}
        </div>
      )}
    </div>
  )
}
