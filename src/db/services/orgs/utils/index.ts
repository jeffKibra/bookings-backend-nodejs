import { OrgModel } from '../../../models';

import { IOrg } from '../../../../types';
//----------------------------------------------------------------

export async function getOrgForUser(userId: string) {
  // console.log("getting org", userId);

  const result = await OrgModel.findOne({
    'metaData.createdBy': userId,
    'metaData.status': 0,
  }).exec();

  if (!result) {
    return null;
  }

  const org = result.toJSON() as unknown as IOrg;

  return org;
}

export async function getById(orgId: string) {
  const result = await OrgModel.findById(orgId).exec();

  if (!result) {
    return null;
  }

  const org = result as unknown as IOrg;

  return org;
}

export async function userHasOrg(userId: string) {
  if (userId) {
    const org = await getOrgForUser(userId);
    if (org) {
      throw new Error('You have an Organization already registered!');
    }
  } else {
    throw new Error('Unknow error');
  }
}

//------------------------------------------------------------
