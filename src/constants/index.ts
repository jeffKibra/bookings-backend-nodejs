import { IContactSummary } from "../types";

//
export const DRAWER_WIDTH = 230;
export const BAR_HEIGHT = 64;

export { default as carModels } from "./carModels";
export { default as accountTypes } from "./accountTypes";
export { default as accounts } from "./accounts";
export { generateAccounts } from "./accounts";
export { default as paymentModes } from "./paymentModes";
export { default as paymentTerms } from "./paymentTerms";
export { default as businessTypes } from "./businessTypes";
export * as ledger from "./ledgers";
export * as dbCollectionsPaths from "./dbCollectionsPaths";

export const walkInCustomer: IContactSummary = {
  companyName: "",
  displayName: "Walk-in Customer",
  id: "walk_in_customer",
  email: "",
  type: "individual",
  contactType: "customer",
};
