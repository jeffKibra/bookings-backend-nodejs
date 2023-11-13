export default function getDateDetails(date: Date = new Date()) {
  const month = date.toDateString().substring(4, 7);
  const year = date.getFullYear();
  const yearMonth = `${year}-${month}`;
  const day = String(date.getDate()).padStart(2, "0");
  const yearMonthDay = `${yearMonth}-${day}`;
  const millis = date.getTime();
  const dateString = date.toDateString();

  return {
    dateString,
    month,
    year,
    yearMonth,
    yearMonthDay,
    millis,
    date,
    day,
  };
}
