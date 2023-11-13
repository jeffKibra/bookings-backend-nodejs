import { AccountMapping } from "../../types/accounts";

function getAccountsMapping(accounts: AccountMapping[]) {
  let newAccounts: AccountMapping[] = [];
  let updatedAccounts: AccountMapping[] = [];
  let deletedAccounts: AccountMapping[] = [];
  let similarAccounts: AccountMapping[] = [];

  accounts.forEach((account) => {
    const { current, incoming } = account;

    if (current === incoming) {
      similarAccounts.push({ ...account });
    } else {
      if (current === 0) {
        newAccounts.push({ ...account });
      } else if (incoming === 0) {
        deletedAccounts.push({ ...account });
      } else {
        updatedAccounts.push({ ...account });
      }
    }
  });
  similarAccounts = similarAccounts.filter((account) => account.incoming !== 0);

  return {
    newAccounts,
    updatedAccounts,
    deletedAccounts,
    similarAccounts,
  };
}

export default getAccountsMapping;
