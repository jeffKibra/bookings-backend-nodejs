import { Account, AccountFromDb } from "../../types";
//----------------------------------------------------------------
export default function formatAccounts(accountsData: {
  [key: string]: AccountFromDb;
}) {
  const accounts: Record<string, Account> = {};

  Object.values(accountsData).forEach((accountFromDB) => {
    const { accountId, accountType, name } = accountFromDB;

    const account: Account = {
      accountId,
      accountType,
      name,
    };

    accounts[accountId] = account;
  });

  return accounts;
}
