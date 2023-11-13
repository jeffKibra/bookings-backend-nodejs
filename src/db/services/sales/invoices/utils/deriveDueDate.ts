import { getFutureDate } from "../../../utils/dates";
import { PaymentTerm } from "../../../types";

export default function deriveDueDate(
  paymentTerm: PaymentTerm,
  startDate: Date = new Date()
) {
  const { days, value } = paymentTerm;
  let waitingDays = days || 0;
  let month = startDate.getMonth() + 1;
  let year = startDate.getFullYear();

  if (waitingDays === 0 && value !== "on_receipt") {
    const remainingDays =
      new Date(year, month, 0).getDate() - startDate.getDate();

    waitingDays += remainingDays;

    if (value === "next_month") {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
      waitingDays += new Date(year, month, 0).getDate();
    }
  }

  //derive the next date based on waiting days
  return waitingDays === 0 ? startDate : getFutureDate(waitingDays, startDate);
}
