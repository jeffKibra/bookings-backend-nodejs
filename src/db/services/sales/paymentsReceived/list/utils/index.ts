import { ObjectId } from 'mongodb';
//
import { IPaginationCursor, IPaginationParams } from '../../../../../../types';

export * as filters from './filters';
export { default as generateSortBy } from './generateSortBy';

export function formatCursor(cursor?: IPaginationCursor) {
  if (!cursor) {
    return null;
  }

  const { isNumber, ...more } = cursor;
  let value = more.value;

  if (isNumber) {
    //convert value to number... all values are string by default
    const tempValue = Number(value);
    if (!isNaN(tempValue)) {
      value = tempValue;
    }
  }

  return {
    ...more,
    value,
  };
}

// function generateFirstSortField(sortOptions?: ISortOptions) {
//   const sortDirection =
//     String(sortOptions?.direction).toLowerCase() === 'desc' ? -1 : 1;
//   const sortField = String(sortOptions?.field || '');

//   const firstSortField = sortField
//     ? { [sortField]: sortDirection } //only registration or rate allowed for sorting
//     : { unused: { $meta: 'searchScore' } }; //sorts by search score(defaults to desc)
//   console.log({ firstSortField });

//   return firstSortField;
// }

// export function generatePaginationCursors(pagination?: IPaginationParams) {
//   let fowardCursor: IPaginationCursor | null = null;
//   let backwardCursor: IPaginationCursor | null = null;

//   if (pagination && typeof pagination === 'object') {
//     fowardCursor =
//       'after' in pagination ? formatCursor(pagination.after) : null;
//     backwardCursor =
//       'before' in pagination ? formatCursor(pagination.before) : null;
//   }

//   return { fowardCursor, backwardCursor };
// }
