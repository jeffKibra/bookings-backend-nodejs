import { IAccount, IAccountSummary } from '../../../../types';
//----------------------------------------------------------------
export default function formatAccounts(accountsData: IAccount[]) {
  const accounts: Record<string, IAccountSummary> = {};

  accountsData.forEach(accountFromDB => {
    const { _id, accountType, name } = accountFromDB;

    const account: IAccountSummary = {
      accountId: _id,
      accountType,
      name,
    };

    accounts[_id] = account;
  });

  return accounts;
}
