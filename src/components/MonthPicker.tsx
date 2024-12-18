import { Calendar } from "primereact/calendar";
import { useClickOutside } from "primereact/hooks";
import { useRef, useState } from "react";
import utils from "../utils/utils";
import "./MonthPicker.css";

type Prop = {
  initialDate: Date;
};

const MonthPicker = ({ initialDate }: Prop) => {
  const [date, setDate] = useState<Date | null>(initialDate);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const overlayRef = useRef(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useClickOutside(overlayRef, (event: Event) => {
    if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
      return;
    }
    setIsMonthPickerVisible(false);

    console.log("hiding month picker");
  });

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        className="flex align-items-center  select-none border-1 border-round border-200 icon-btn p-0 cursor-pointer"
        onClick={() => {
          setIsMonthPickerVisible((value) => !value);
          console.log("showing month picker");
        }}
      >
        <div className="mx-2 text-xs">
          {utils.dateToMMYY(date ?? new Date())}
        </div>
        <div
          className="pi pi-calendar icon-btn cursor-pointer mr-1"
          style={{ fontSize: "0.8rem" }}
        ></div>
      </div>
      {isMonthPickerVisible && (
        <div ref={overlayRef}>
          <Calendar
            className="month-picker"
            value={date}
            onChange={(e) => {
              setDate(e.value as Date);
              setIsMonthPickerVisible(false);
              console.log(e.value);
            }}
            view="month"
            inline
            dateFormat="mm/yy"
          />
        </div>
      )}
    </div>
  );
};

export default MonthPicker;
