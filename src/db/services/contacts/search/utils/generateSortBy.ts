import { ISortBy, IUserSortBy, ISortByDirection } from '../../../../../types';

export default function generateSortBy(
  query: string | number,
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
      : query
      ? 'searchScore'
      : 'createdAt';

  const sortBy: ISortBy = [field, direction];

  console.log({ sortBy });

  return sortBy;
}
