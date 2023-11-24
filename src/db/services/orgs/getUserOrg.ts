import { getOrgForUser } from './utils';

export default async function getUserOrg(userUID: string) {
  const org = await getOrgForUser(userUID);
  console.log('org', org);

  return org;
}
