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
    // {
    //   equals: {
    //     path: 'metaData.deleted',
    //     value: false,
    //   },
    // },
  ];

  if (userFilters && typeof userFilters === 'object') {
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
          let fieldPath = field;

          const isModelNameField = field === 'model';
          const isModelField =
            isModelNameField || field === 'make' || field === 'type';

          if (isModelField) {
            const evaluatedField = isModelNameField ? 'name' : field;
            fieldPath = `model.${evaluatedField}`;
          }

          filter = generateQueryStringFilter(fieldPath, values);
        }

        filters.push(filter);
      }
    });
  }

  console.log('search vehicles aggregation pipeline filters: ', filters);

  return filters;
}
