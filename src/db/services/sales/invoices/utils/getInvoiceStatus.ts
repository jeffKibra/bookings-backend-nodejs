import { checkIfIsSameDay } from "../../../utils/dates";
import { Invoice } from "../../../types";

function getDaysDifference(
  date: Date = new Date(),
  futureDate: Date = new Date()
) {
  return Math.floor(
    (futureDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function getInvoiceStatus(invoice: Invoice) {
  const { balance, total, dueDate, isSent } = invoice;
  const today = new Date();
  const isDue = dueDate.getTime() > today.getTime();
  const daysDue = getDaysDifference(today, dueDate);

  const dueToday = checkIfIsSameDay(today, dueDate);

  const partiallyPaid = balance < total;

  //   const overdue = today.getTime() > dueDate.getTime();
  const overdueDays = getDaysDifference(dueDate, today);

  let status = "";
  let message = "";

  if (balance === 0) {
    status = "PAID";
  } else if (partiallyPaid && (dueToday || isDue)) {
    status = "PARTIALLY PAID";
  } else if (dueToday) {
    status = "DUE TODAY";
  } else if (isDue) {
    status = isSent ? "SENT" : "PENDING";
  } else {
    status = `OVERDUE`;
  }

  switch (status) {
    case "PAID":
    case "PARTIALLY PAID":
    case "DUE TODAY":
      message = status;
      break;
    case "SENT":
    case "PENDING":
      message = `DUE IN ${daysDue} DAYS`;
      break;
    case "OVERDUE":
      message = `OVERDUE BY ${overdueDays} DAYS`;
      break;
    default:
      message = status;
  }

  return { status, message };
}
