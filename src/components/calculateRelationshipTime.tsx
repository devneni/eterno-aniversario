export const calculateRelationshipTime = (startDate: string, startTime?: string): string => {
  if (!startDate) return "";

  const startDateTime = new Date(startDate);
  const now = new Date();
  if (startTime) {
    const [h, m] = startTime.split(":").map(Number);
    startDateTime.setHours(h, m, 0, 0);
  } else {
    startDateTime.setHours(0, 0, 0, 0);
  }

  if (isNaN(startDateTime.getTime())) return "";

  let years = now.getFullYear() - startDateTime.getFullYear();
  let months = now.getMonth() - startDateTime.getMonth();
  let days = now.getDate() - startDateTime.getDate();
  let hours = now.getHours() - startDateTime.getHours();
  let minutes = now.getMinutes() - startDateTime.getMinutes();
  let seconds = now.getSeconds() - startDateTime.getSeconds();

  if (seconds < 0) {
    minutes--;
    seconds += 60;
  }

  if (minutes < 0) {
    hours--;
    minutes += 60;
  }

  if (hours < 0) {
    days--;
    hours += 24;
  }

  if (days < 0) {
    months--;
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastDayPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} dia${days > 1 ? "s" : ""}`);

  if (startTime) {
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? "s" : ""}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} segundo${seconds > 1 ? "s" : ""}`);
  }

  return parts.join(", ");
};