import React, { useState } from 'react'
import './Switch.css';

type Props = {
  defaultValue?: string;
  values: string[];
  onSelect?: (value: string) => void;
}
export default function Switch({ values, defaultValue, onSelect }: Props) {
  const [selected, setSelected] = useState(defaultValue);

  const onChange = (value: string) => {
    setSelected(value);
    onSelect?.(value);
  }
  return (
    <div className='Switch inline-flex p-2'>
      {values.map((value) =>
        <div key={value} 
          className={'px-2 cursor-pointer ' + (value == selected ? 'highlight-bg' : '')} 
          onClick={() => onChange(value)}
        >
          {value}
        </div>
      )}
    </div>
  )
}
