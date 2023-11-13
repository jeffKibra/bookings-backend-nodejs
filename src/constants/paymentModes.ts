import { PaymentMode } from "../types";

type Modes = {
  [key: string]: PaymentMode;
};

const paymentModes: Modes = {
  cash: { name: "Cash", value: "cash" },
  m_pesa: { name: "M-pesa", value: "m_pesa" },
  cheque: { name: "Cheque", value: "cheque" },
  bank_transfer: { name: "Bank Transfer", value: "bank_transfer" },
  bank_remittance: { name: "Bank Remittance", value: "bank_remittance" },
  credit_card: { name: "Credit Card", value: "credit_card" },
};

export default paymentModes;
