import generateRangeFilter from './generateRangeFilter';
import generateQueryStringFilter from './generateQueryStringFilter';
//

const filterFields = ['make', 'model', 'type', 'color', 'rate'];

type Filters = {};

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
        let fieldPrefix = '';

        const isModelField = field === 'model' || field === 'type';
        if (isModelField) {
          fieldPrefix = 'model.';
        }

        filter = generateQueryStringFilter(`${fieldPrefix}${field}`, values);
      }

      filters.push(filter);
    }
  });

  console.log({ filters });

  return filters;
}
