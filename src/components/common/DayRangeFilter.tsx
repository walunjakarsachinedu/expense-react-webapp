
import { Button } from "primereact/button";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { Tooltip } from "primereact/tooltip";
import { useEffect, useState } from "react";
import useExpenseStore from "../../store/usePersonStore";
import utils from "../../utils/utils";

export default function DayRangeFilter() {
    const filter = useExpenseStore(store => store.filter);
    const monthYear = useExpenseStore((store) => store.monthYear);
    const updateFilter = useExpenseStore(store => store.updateFilter);

    const [isSliderVisible, setIsSliderVisible] = useState<boolean>(false);

    const value: [number, number] = [filter.startDay ?? 1, filter.endDay ?? utils.getLastDayOfMonth(monthYear)];
    const [lowerValue, upperValue] = [...value].sort((a,b) => a-b); 

    const handleOnRangeChange = (e: SliderChangeEvent) => {
      const value = e.value as [number, number];
      const [lowerValue, upperValue] = [...value].sort((a,b) => a-b); 
      updateFilter({ startDay: lowerValue, endDay: upperValue });
    }

    useEffect(() => {
      return () => {
        updateFilter({});
      }
    }, [updateFilter]);

    return (
      <div className="flex">
        {isSliderVisible && <>
          <div className="px-4" style={{backgroundColor: "#818cf826", padding: ".9rem", borderTopLeftRadius: "8px", borderBottomLeftRadius: "10px"}}>
            <Tooltip 
              target={`.slider-my-date-range>.p-slider-handle-start`}
              position="top"
              event="hover"
              content={`${value[0]}`}
            />
            <Tooltip
              target={`.slider-my-date-range>.p-slider-handle-end`}
              position="top"
              event="hover"
              content={`${value[1]}`}
            />
            <Slider 
              value={value} 
              step={1} 
              min={1}
              max={31}
              onChange={(e) => handleOnRangeChange(e)} 
              className="w-14rem slider-my-date-range" range 
            />
          </div>
        </>
        }
        <Button 
          size="small" 
          className="w-100 flex items-center justify-center white-space-nowrap" 
          style={{
            padding: "0.4rem 0.5rem", 
            maxWidth: "9rem", 
            borderTopRightRadius: "8px", 
            borderBottomRightRadius: "8px", 
            ...(isSliderVisible ? {
              borderTopLeftRadius: "0px", 
              borderBottomLeftRadius: "0px"
            } : {})
          }} 
          onClick={() => setIsSliderVisible(!isSliderVisible)}
          outlined
        >
          <div>
          Day Fliter ({lowerValue.toString().padStart(2, "0")}, {upperValue.toString().padStart(2, "0")})
          </div>
        </Button>
      </div>
    )
}