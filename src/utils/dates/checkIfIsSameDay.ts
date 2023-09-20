export default function checkIfIsSameDay(
  date1: Date | string = new Date(),
  date2: Date | string = new Date()
) {
  return (
    new Date(date1).getDate() === new Date(date2).getDate() &&
    new Date(date1).getMonth() === new Date(date2).getMonth() &&
    new Date(date1).getFullYear() === new Date(date2).getFullYear()
  );
}
