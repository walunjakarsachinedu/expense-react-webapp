import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useClickOutside } from "primereact/hooks";
import { RefObject, useEffect, useRef, useState } from "react";
import { usePreventHorizontalOverflow } from "../../hooks/usePreventHorizontalOverflow";
import useExpenseStore from "../../store/usePersonStore";
import utils from "../../utils/utils";
import "./DayRangeFilter.scss";

export default function DayRangeFilter() {
  const filter = useExpenseStore(store => store.filter);
  const monthYear = useExpenseStore(store => store.monthYear);
  const updateFilter = useExpenseStore(store => store.updateFilter);

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const [month, year] = monthYear.split("-").map(Number); // expects "MM-yyyy"
  const lastDay = utils.getLastDayOfMonth(monthYear);
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month - 1, lastDay);
  const [localValue, setLocalValue] = useState<[Date | null, Date | null] | null>([firstDate, lastDate]);

  const calendarRef = useRef<HTMLSpanElement|undefined>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const startDay = filter.startDay ?? 1;
  const endDay = filter.endDay ?? lastDay;
  const label = `${startDay.toString().padStart(2, "0")} - ${endDay.toString().padStart(2, "0")}`;

  const handleButtonClick = () => {
    setIsCalendarVisible((v) => !v);
  };

  useClickOutside(calendarRef as RefObject<Element>, (event: Event) => {
    if (buttonRef.current?.contains(event.target as Node)) return;
    setIsCalendarVisible(false);
  });

  useEffect(() => {
    return () => {
      updateFilter({});
    };
  }, [updateFilter]);

  usePreventHorizontalOverflow(calendarRef, [isCalendarVisible]);

  return (
    <div className="relative">
      <div ref={buttonRef}>
       <Button 
          size="small" 
          className="w-100 flex items-center justify-center white-space-nowrap" 
          style={{ padding: "0.4rem 0.5rem" }} 
          onClick={handleButtonClick}
          outlined
        >
          <div className="flex items-center"> Day Filter ({label}) &nbsp; <i className="pi pi-calendar"></i></div>
        </Button>
      </div>

      {isCalendarVisible && (
        <Calendar
          ref={(ref) => {calendarRef.current = ref?.getElement()}}
          className="day-range-picker"
          value={localValue}
          onChange={(e) => {
            const range = e.value as [Date | null, Date | null];
            setLocalValue(range);
            const [start, end] = range ?? [];
            // Only commit to store + close once both ends are picked
            if (start && end) {
              updateFilter({ startDay: start.getDate(), endDay: end.getDate() });
              setTimeout(() => setIsCalendarVisible(false), 400);
            }
          }}
          selectionMode="range"
          viewDate={firstDate}
          onViewDateChange={() => {}} // lock navigation
          inline
        />
      )}
    </div>
  );
}