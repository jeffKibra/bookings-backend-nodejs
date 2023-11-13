export default function getLocalDateValues(newDate = new Date()) {
  const timeZone = "Africa/Nairobi";

  const day = +new Date(newDate).toLocaleDateString("en-US", {
    timeZone,
    day: "numeric",
  });
  const month = +new Date(newDate).toLocaleString("en-US", {
    timeZone,
    month: "numeric",
  });
  const monthString = new Date(newDate).toLocaleString("en-US", {
    timeZone,
    month: "short",
  });
  const year = +new Date(newDate).toLocaleString("en-US", {
    timeZone,
    year: "numeric",
  });
  const localDateAndTime = new Date(newDate).toLocaleString("en-US", {
    timeZone,
  });

  const localDate = new Date(newDate).toLocaleDateString("en-US", {
    timeZone,
  });

  const localTime = new Date(newDate).toLocaleTimeString("en-US", {
    timeZone,
  });

  const yearMonth = `${year}-${monthString}`;
  const yearMonthDay = `${yearMonth}-${day}`;

  return {
    day,
    month,
    monthString,
    year,
    localDate,
    localTime,
    localDateAndTime,
    yearMonth,
    yearMonthDay,
  };
}
