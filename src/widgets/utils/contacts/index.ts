import { IContactSummary, IContact } from "../../types";

export function createSummary(contact: IContact): IContactSummary {
  const { displayName, type, companyName, email, id, contactType } = contact;

  return { displayName, type, companyName, email, id, contactType };
}
