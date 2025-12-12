export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatIntervalFromSeconds = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }

  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  }

  const hours = Math.floor(seconds / 3600);
  return `${hours} hours`;
};

export const formatMilliseconds = (milliseconds: number) => {
  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  if (milliseconds < 60000) {
    const seconds = (milliseconds / 1000).toFixed(2);
    return `${seconds} s`;
  }

  if (milliseconds < 3600000) {
    const minutes = (milliseconds / 60000).toFixed(2);
    return `${minutes} min`;
  }

  const hours = (milliseconds / 3600000).toFixed(2);
  return `${hours} h`;
};
