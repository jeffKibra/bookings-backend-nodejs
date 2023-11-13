import { mapAccounts, summarizeItemsIntoAccounts } from ".";

interface Item {
  accountId: string;
  amount: number;
}

export default function getAccountsMapping(
  currentItems: Item[],
  incomingItems: Item[]
) {
  /**
   * group both items arrays into their respective income accounts
   */
  const currentAccounts = summarizeItemsIntoAccounts(currentItems);
  const incomingAccounts = summarizeItemsIntoAccounts(incomingItems);

  return mapAccounts(currentAccounts, incomingAccounts);
}
