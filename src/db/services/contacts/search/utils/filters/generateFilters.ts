import { filters } from '../../../../utils';
//

const { generateQueryStringFilter, generateRangeFilter } = filters;

const filterFields = ['make', 'model', 'type', 'color', 'rate'];

type Filters = {};

export default function generateFilters(
  orgId: string,
  userFilters?: Record<string, (string | number | Date)[]>
) {
  const filters: Record<string, unknown>[] = [
    {
      text: {
        path: 'metaData.orgId',
        query: orgId,
      },
    },
    {
      equals: {
        path: 'metaData.status',
        value: 0,
      },
    },
  ];

  if (userFilters && typeof userFilters === 'object') {
    filterFields.forEach(field => {
      const values = userFilters[field];
      if (Array.isArray(values) && values.length > 0) {
        let filter = {};

        let fieldPrefix = '';

        if (field === 'contactType') {
          fieldPrefix = 'metaData.';
        }

        filter = generateQueryStringFilter(`${fieldPrefix}${field}`, values);

        filters.push(filter);
      }
    });
  }

  console.log('search vehicles aggregation pipeline filters: ', filters);

  return filters;
}
