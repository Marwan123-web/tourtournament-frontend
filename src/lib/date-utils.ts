export const formatTime = (date: string, time: string) =>
  new Date(date + "T" + time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateShort = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const calculateDurationHours = (
  date: string,
  startTime: string,
  endTime: string
): number => {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const calculateTotalPrice = (
  date: string,
  startTime: string,
  endTime: string,
  pricePerHour: number
): string => {
  const hours = calculateDurationHours(date, startTime, endTime);
  const price = pricePerHour;
  return (hours * price).toFixed(2);
};
