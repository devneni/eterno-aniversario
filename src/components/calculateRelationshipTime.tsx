export const calculateRelationshipTime = (startDate: string, startTime: string): string => {
  if (!startDate) {
    return "";
  }

  const startDateTime = new Date(startDate);
  const today = new Date();

  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
  } else {
    startDateTime.setHours(0, 0, 0, 0);
  }

  if (isNaN(startDateTime.getTime())) {
    return "";
  }


  let diffMs = today.getTime() - startDateTime.getTime();
  

  if (diffMs < 0) {
    return "";
  }


  let years = today.getFullYear() - startDateTime.getFullYear();
  
  let months = today.getMonth() - startDateTime.getMonth();
  

  let days = today.getDate() - startDateTime.getDate();

 
  if (days < 0) {
  
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    

    const startDay = startDateTime.getDate();
    const adjustedStartDay = startDay > lastDayOfPreviousMonth ? lastDayOfPreviousMonth : startDay;
    
    days = lastDayOfPreviousMonth - adjustedStartDay + today.getDate();
    months--; 
  if (months < 0) {
    years--;
    months += 12;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (startTime) {
    let hours = today.getHours() - startDateTime.getHours();
    let minutes = today.getMinutes() - startDateTime.getMinutes();
    let seconds = today.getSeconds() - startDateTime.getSeconds();

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
      
      if (days < 0) {
        months--;
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += lastDayOfMonth;
        
        if (months < 0) {
          years--;
          months += 12;
        }
      }
    }

    const parts = [];
    
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
    if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(", ") : "0 segundos";
  } else {
  
    const parts = [];
    
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);

    return parts.join(", ");
  }
};