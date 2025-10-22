import { Calendar } from "primereact/calendar";
import { useClickOutside } from "primereact/hooks";
import { RefObject, useRef, useState } from "react";
import utils from "../utils/utils";
import "./MonthPicker.scss";
import useIsOffline from "../hooks/useIsOffline";

type Prop = {
  initialDate: Date;
  // provide date in format: MM-yyyy
  onDateChange: (date: string) => void;
};

const MonthPicker = ({ initialDate, onDateChange }: Prop) => {
  const isOffline = useIsOffline();
  const [date, setDate] = useState<Date>(initialDate);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useClickOutside(overlayRef as RefObject<Element>, (event: Event) => {
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
        className={`flex align-items-center  select-none border-1 border-round border-200 icon-btn p-0 white-space-nowrap ${isOffline ? "disabled cursor-not-allowed" : ""
          }`}
        onClick={
          !isOffline
            ? () => {
              setIsMonthPickerVisible((value) => !value);
              console.log("showing month picker");
            }
            : undefined
        }
      >
        <div className="mx-2" style={{ fontSize: ".8rem" }}>
          {utils.formatToMonthYear(date)}
        </div>
        <div
          className={`pi pi-calendar icon-btn  mr-1 ${isOffline ? "cursor-not-allowed" : ""
            }`}
          style={{ fontSize: ".9rem" }}
        ></div>
      </div>
      {isMonthPickerVisible && (
        <div ref={overlayRef}>
          <Calendar
            className="month-picker"
            value={date}
            onChange={(e) => {
              setDate(e.value as Date);
              onDateChange(utils.formatToMonthYear(e.value as Date));
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
