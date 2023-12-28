import {
  ISortBy,
  IUserSortBy,
  ISortByDirection,
} from '../../../../../../types';

export default function generateSortBy(
  paymentId: string,
  userSortBy?: IUserSortBy
) {
  let userSortByField = '';

  let direction: ISortByDirection = -1;

  if (Array.isArray(userSortBy)) {
    userSortByField = userSortBy[0];
    direction = userSortBy[1] === 'asc' ? 1 : -1;
  }

  const field =
    userSortByField && typeof userSortByField === 'string'
      ? userSortByField
      : paymentId
      ? 'paymentAllocation'
      : 'metaData.createdAt';

  const sortBy: ISortBy = [field, direction];

  console.log({ sortBy });

  return sortBy;
}
