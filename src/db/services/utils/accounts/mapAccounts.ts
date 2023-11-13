import { AccountMapping } from "../../types";

type MapAccount = {
  accountId: string;
  amount: number;
};

export default function mapAccounts(
  currentAccounts: MapAccount[],
  incomingAccounts: MapAccount[]
) {
  console.log("currentAccounts", currentAccounts);
  console.log("incomingAccounts", incomingAccounts);
  const similarAccounts: AccountMapping[] = [];
  const updatedAccounts: AccountMapping[] = [];
  const newAccounts: AccountMapping[] = [];
  const deletedAccounts: AccountMapping[] = [];

  currentAccounts.forEach((account) => {
    const { accountId, amount } = account;
    let dataMapping: AccountMapping = {
      current: amount,
      incoming: 0,
      accountId,
    };
    /**
     * find if this income account is also in incoming accounts
     */
    const index = incomingAccounts.findIndex(
      (incomingAccount) => incomingAccount.accountId === accountId
    );

    if (index > -1) {
      /**
       * account is in both arrays
       * remove account from incomingAccounts array
       */
      const incomingTotal = incomingAccounts.splice(index, 1)[0].amount;
      dataMapping.incoming = incomingTotal;

      if (dataMapping.current === incomingTotal) {
        if (incomingTotal > 0) {
          similarAccounts.push(dataMapping);
        }
      } else {
        //values are not equal
        const isNewAccount = dataMapping.current === 0 && incomingTotal > 0;
        const isUpdatedAccount = dataMapping.current > 0 && incomingTotal > 0;
        const isDeletedAccount = dataMapping.current > 0 && incomingTotal === 0;

        if (isNewAccount) {
          newAccounts.push(dataMapping);
        } else if (isUpdatedAccount) {
          updatedAccounts.push(dataMapping);
        } else if (isDeletedAccount) {
          deletedAccounts.push(dataMapping);
        } else {
          console.log(
            `Invalid accounts mapping data accountId:${accountId} ` +
              `current:${dataMapping.current} incoming:${incomingTotal} `
          );
        }
      }
    } else {
      /**
       * account is in only the currentAccounts array
       * this means this account is to be deleted
       */
      if (dataMapping.current > 0) {
        deletedAccounts.push(dataMapping);
      }
    }
  });

  /**
   * check if there are items remaining in the incoming accounts array
   * add them the new accounts array
   */
  if (incomingAccounts.length > 0) {
    incomingAccounts.forEach((account) => {
      const { amount, accountId } = account;

      if (amount > 0) {
        const dataMapping: AccountMapping = {
          current: 0,
          incoming: amount,
          accountId,
        };

        newAccounts.push(dataMapping);
      }
    });
  }

  const uniqueAccounts = [
    ...similarAccounts,
    ...deletedAccounts,
    ...newAccounts,
    ...updatedAccounts,
  ];

  console.log("uniqueAccounts", uniqueAccounts);
  console.log("deletedAccounts", deletedAccounts);
  console.log("updatedAccounts", updatedAccounts);
  console.log("newAccounts", newAccounts);

  return {
    uniqueAccounts,
    similarAccounts,
    deletedAccounts,
    newAccounts,
    updatedAccounts,
  };
}
