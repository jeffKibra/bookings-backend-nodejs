import { AccountModel } from '../../../models';

import { IAccount, IAccountType } from '../../../../types';

//----------------------------------------------------------------

export default async function getAllAccountsRaw(orgId: string) {
  const rawAccounts = await AccountModel.find({
    $or: [{ 'metaData.orgId': orgId }, { 'metaData.orgId': 'all' }],
  }).exec();

  const accounts: IAccount[] = [];

  rawAccounts.forEach(account => {
    const { accountType, name, description, tags, _id, metaData } = account;

    accounts.push({
      _id: _id.toString(),
      name,
      accountType: accountType as IAccountType,
      description,
      tags,
      metaData: metaData,
    });
  });

  console.log('accounts', accounts);

  return accounts;
}
