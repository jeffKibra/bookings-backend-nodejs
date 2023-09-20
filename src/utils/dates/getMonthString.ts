export default function getMonthString(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
  });
}
