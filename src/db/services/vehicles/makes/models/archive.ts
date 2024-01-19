import { ObjectId } from 'mongodb';

import { ICustomThis } from './create';

export default async function archive(
  this: ICustomThis,
  userUID: string,
  id: string
) {
  const { make, orgId } = this;
  // const { makeId } = this as unknown as ICustomThis;
}
