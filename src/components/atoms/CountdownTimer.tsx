import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiryDate: string; // ISO format string
  onExpire: () => void; // Callback for when the timer expires
}

interface TimeLeft {
  total: number; // Total milliseconds left
  minutes: number;
  seconds: number;
}

// Helper function to calculate the time left
const calculateTimeLeft = (expiryDate: string): TimeLeft => {
  const now = new Date();
  const difference = new Date(expiryDate).getTime() - now.getTime();

  const total = Math.max(difference, 0); // Ensure total is not negative
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / (1000 * 60)) % 60);

  return { total, minutes, seconds };
};

export default function CountdownTimer({
  expiryDate,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(expiryDate)
  );

  // NOTE: We set the interval to 500ms to prevent flickering.
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryDate);
      setTimeLeft(newTimeLeft);

      // Clear the interval if the time is up and call onExpire
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onExpire(); // Emit the expiration event
      }
    }, 500);

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, [expiryDate, onExpire]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <span>
      {timeLeft.total > 0 ? (
        <span>{formatTime(timeLeft.minutes, timeLeft.seconds)}</span>
      ) : (
        <span>0</span>
      )}
    </span>
  );
}
