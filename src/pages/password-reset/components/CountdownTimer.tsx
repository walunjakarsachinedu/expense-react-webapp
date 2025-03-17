import { useEffect, useState } from "react";

type Props = {
  startSeconds: number;
  onExpire: () => void;
};

const CountdownTimer = ({ startSeconds, onExpire }: Props) => {
  const [timeLeft, setTimeLeft] = useState(startSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
