import { translations } from './translations'; 

export const calculateRelationshipTime = (
  startDate: string, 
  startTime?: string, 
  language: 'pt' | 'en' = 'pt'
): string => {
  if (!startDate) return "";

  const t = translations[language];
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
  

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? t.year : t.years}`);
  }
  

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? t.month : t.months}`);
  }
  

  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ${days === 1 ? t.day : t.days}`);
  }


  if (startTime) {
    if (hours > 0) {
      parts.push(`${hours} ${language === 'pt' ? (hours === 1 ? 'hora' : 'horas') : (hours === 1 ? 'hour' : 'hours')}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${language === 'pt' ? (minutes === 1 ? 'minuto' : 'minutos') : (minutes === 1 ? 'minute' : 'minutes')}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${language === 'pt' ? (seconds === 1 ? 'segundo' : 'segundos') : (seconds === 1 ? 'second' : 'seconds')}`);
    }
  }

  return parts.join(", ");
};