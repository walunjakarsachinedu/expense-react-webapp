import './Switch.css';

type Props = {
  selectedValue?: string;
  values: string[];
  onSelect?: (value: string) => void;
}
export default function Switch({ values, selectedValue, onSelect }: Props) {
  return (
    <div className='Switch inline-flex p-2'>
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
