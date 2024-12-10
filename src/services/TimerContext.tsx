import { createContext, ReactNode } from "react";
import Timer from "../utils/Timer";

const TimerContext = createContext<Timer>({} as Timer);

type Props = {
  children: ReactNode;
};

const TimerProvider = ({ children }: Props) => {
  const timer = new Timer({ debounceTime: 3, thresholdTime: 10 });
  return (
    <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
  );
};

export { TimerContext, TimerProvider };
