import { PaymentTerm } from "../types";

type Terms = {
  [key: string]: PaymentTerm;
};

const paymentTerms: Terms = {
  on_receipt: {
    name: "Due on Receipt",
    value: "on_receipt",
    days: 0,
  },
  net_15: {
    name: "Net 15",
    value: "net_15",
    days: 15,
  },
  net_30: {
    name: "Net 30",
    value: "net_30",
    days: 30,
  },
  net_45: {
    name: "Net 45",
    value: "net_45",
    days: 45,
  },
  net_60: {
    name: "Net 60",
    value: "net_60",
    days: 60,
  },
  end_month: {
    name: "Due end of the month",
    value: "end_month",
    days: 0,
  },
  next_month: {
    name: "Due end of next month",
    value: "next_month",
    days: 0,
  },
};

export default paymentTerms;
