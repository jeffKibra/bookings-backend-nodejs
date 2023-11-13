export default function checkIfIsSameDay(
  date1: Date = new Date(),
  date2: Date = new Date()
) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
