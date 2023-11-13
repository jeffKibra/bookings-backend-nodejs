import { checkIfIsSameDay } from "../../../utils/dates";

export default function checkIfOverdue(dateToCheck: Date, refDate: Date) {
  const isSameDay = checkIfIsSameDay(dateToCheck, refDate);
  console.log(isSameDay);
  if (isSameDay) {
    //invoice is due today-not yet overdue
    return false;
  }

  const isOverdue = dateToCheck.getTime() > refDate.getTime();

  return isOverdue;
}
