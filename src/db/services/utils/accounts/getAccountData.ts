//
import { AccountModel } from '../../../models';
//
import { IAccountSummary, IAccountType } from '../../../../types';

// export default function getAccountData(accountId: string,
//  accounts: Record<string, Account>) {
//   const found = accounts.find((account) => account.accountId === accountId);
//   if (!found) {
//     throw new Error(`Account data with id ${accountId} not found!`);
//   }
//   const { accountType, name } = found;
//   return {
//     name,
//     accountId,
//     accountType,
//   };
// }

export default async function getAccountData(accountId: string) {
  const rawAccount = await AccountModel.findById(accountId).exec();

  if (!rawAccount) {
    throw new Error(`Account data with id ${accountId} not found!`);
  }

  const { accountType, name } = rawAccount;

  const account: IAccountSummary = {
    name,
    accountId,
    accountType: accountType as IAccountType,
  };

  return account;
}

// export default function getAccountData(
//   accountId: string,
//   accounts: Record<string, Account>
// ) {
//   const account = accounts[accountId];

//   if (!account) {
//     throw new Error(`Account data with id ${accountId} not found!`);
//   }

//   const { accountType, name } = account;

//   return {
//     name,
//     accountId,
//     accountType,
//   };
// }
