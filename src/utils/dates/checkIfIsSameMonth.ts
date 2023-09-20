export default function checkIfIsSameMonth(
  date1: Date = new Date(),
  date2: Date = new Date()
) {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
