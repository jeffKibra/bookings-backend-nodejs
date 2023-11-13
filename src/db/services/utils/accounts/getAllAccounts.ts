import getAllAccountsRaw from "./getAllAccountsRaw";
import formatAccounts from "./formatAccounts";

//----------------------------------------------------------------
export default async function getAllAccounts(orgId: string) {
  const accountsData = await getAllAccountsRaw(orgId);

  const accounts = formatAccounts(accountsData);

  console.log("accounts from db", accounts);

  return accounts;
}
