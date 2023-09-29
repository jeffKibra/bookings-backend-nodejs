import generateRangeFilter from './generateRangeFilter';
import generateQueryStringFilter from './generateQueryStringFilter';
//

const filterFields = ['make', 'model', 'type', 'color', 'rate'];

export default function generateFilters(
  userFilters?: Record<string, (string | number | Date)[]>
) {
  if (!userFilters || typeof userFilters !== 'object') {
    return [];
  }

  const filters: Record<string, unknown>[] = [];

  filterFields.forEach(field => {
    const values = userFilters[field];
    if (Array.isArray(values) && values.length > 0) {
      let filter = {};

      if (field === 'rate') {
        const tempFilter = generateRangeFilter(field, values);
        if (tempFilter) {
          filter = tempFilter;
        }
      } else {
        filter = generateQueryStringFilter(field, values);
      }

      filters.push(filter);
    }
  });

  return filters;
}
