import { filters } from '../../../../utils';
//

const { generateQueryStringFilter, generateRangeFilter } = filters;

const filterFields = ['group'];

export default function generateFilters(
  orgId: string,
  userFilters?: Record<string, (string | number | Date)[]>
) {
  // console.log('userFilters', userFilters);
  const filters: Record<string, unknown>[] = [
    // {
    //   text: {
    //     path: 'metaData.orgId',
    //     query: orgId,
    //   },
    // },
    {
      queryString: {
        defaultPath: 'metaData.orgId',
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
      // console.log({ field, values });

      if (Array.isArray(values) && values.length > 0) {
        let filter = {};

        let fieldPrefix = '';

        if (field === 'group') {
          fieldPrefix = 'metaData.';
        }

        filter = generateQueryStringFilter(`${fieldPrefix}${field}`, values);

        filters.push(filter);
      }
    });
  }

  console.log('search contacts aggregation pipeline filters: ', filters);

  return filters;
}
