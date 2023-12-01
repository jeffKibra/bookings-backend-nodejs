import { IContactSummary, IContact } from "../../../../types";

export function createSummary(contact: IContact): IContactSummary {
  const { displayName,_id } = contact;

  return { displayName, _id,  };
}
