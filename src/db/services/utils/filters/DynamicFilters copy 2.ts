import { generateQueryStringFilter, generateRangeFilter } from '.';
//

const dynamicFieldPaths = {
  rate: 'rate',
  color: 'color',
  model: 'model.name',
  make: 'model.make',
  type: 'model.type',
};
const filterFields = Object.keys(dynamicFieldPaths);

const staticFieldPaths = {
  orgId: 'metaData.orgId',
  status: 'metaData.status',
};

const fieldPaths = {
  orgId: 'metaData.orgId',
  status: 'metaData.status',
  ...dynamicFieldPaths,
};

type IFieldPaths = keyof typeof fieldPaths;
//

interface IGeneralFilter {
  path: string;
  values: (string | number | Date)[];
}

type IUserFiltersValues = (string | number | Date)[];
type IUserFilters = Record<string, IUserFiltersValues>;

interface IDynamicFilter {
  path: string;
  type: 'range' | 'normal';
}
type IDynamicFiltersFieldsMap = Record<string, IDynamicFilter>;

export default class DynamicFilters {
  //
  fieldsMap: IDynamicFiltersFieldsMap;

  //
  searchFilters: Record<string, unknown>[] = [];
  matchFilters: Record<string, unknown> = {};
  //
  userFilters?: IUserFilters;
  //
  query: string;

  constructor(
    query: DynamicFilters['query'],
    fieldsMap: DynamicFilters['fieldsMap'],
    userFilters?: DynamicFilters['userFilters']
  ) {
    this.query = query;
    this.fieldsMap = fieldsMap;
    this.userFilters = userFilters;
  }

  generateFilters(userFilters?: Parameters<DynamicFilters['_generate']>[0]) {
    this._generate(userFilters);

    const { matchFilters, searchFilters } = this;

    console.log('match filters', matchFilters);
    console.log('search filters', searchFilters);

    const filters = { searchFilters, matchFilters };

    return filters;
  }
  // generateDynamicFilters;

  _generate(userFilters?: IUserFilters) {
    if (userFilters && typeof userFilters === 'object') {
      const { fieldsMap } = this;
      const dynamicFieldPaths = Object.keys(fieldsMap);

      Object.keys(dynamicFieldPaths).forEach(field => {
        const values = userFilters[field];

        if (Array.isArray(values) && values.length > 0) {
          this.appendFilter(field, values);
        }
      });
    }
  }

  appendFilter(field: string, values: IUserFiltersValues) {
    const { fieldsMap } = this;

    const fieldType = fieldsMap[field].type;
    const isRangeFilter = fieldType === 'range';

    if (isRangeFilter) {
      //append to search filters
      this.appendRangeFilter(field, values);
    } else {
      //append to match filters
      this.appendStringFilter(field, values);
    }
  }

  appendRangeFilter(field: string, values: IUserFiltersValues) {
    const { query } = this;

    const fieldPath = this.getFieldPath(field);

    const filter = generateRangeFilter(fieldPath, values);

    if (filter) {
      if (query) {
        //append to search filters
        this.appendSearchFilter(filter);
      } else {
        //append to match filters
        const { gte, lte } = filter.range;
        this.appendMatchFilter(fieldPath, { $gte: gte, $lte: lte });
      }
    }
  }

  appendStringFilter(field: string, values: IUserFiltersValues) {
    const { query } = this;

    const fieldPath = this.getFieldPath(field);

    if (query) {
      //append to search filters
      const filter = generateQueryStringFilter(fieldPath, values);

      this.appendSearchFilter(filter);
    } else {
      //append to match filters
      const filter = values.length === 1 ? values[0] : { $in: [...values] };
      this.appendMatchFilter(fieldPath, filter);
    }
  }

  appendMatchFilter(field: string, filter: unknown) {
    this.matchFilters[field] = filter;
  }

  appendSearchFilter(filter: {}) {
    return this.searchFilters.push(filter);
  }

  getFieldPath(field: string) {
    const { fieldsMap } = this;

    return fieldsMap[field].path;
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------

  static generateQueryStringFilter(
    fieldPath: string,
    values: IUserFiltersValues
  ) {
    let queryString = '';

    values.forEach((value, index) => {
      const subString = String(value);

      if (index === 0) {
        queryString = subString;
      } else {
        queryString = `${queryString} OR ${subString}`;
      }
    });

    return {
      queryString: {
        defaultPath: fieldPath,
        query: queryString,
      },
    };
  }
  //--------------------------------------------------------------------

  static generateRangeFilter(fieldPath: string, values: IUserFiltersValues) {
    if (values.length !== 2) {
      return null;
    }

    const min = +values[0];
    const max = +values[1];
    return {
      range: {
        path: fieldPath,
        gte: min,
        lte: max,
      },
    };
  }

  //--------------------------------------------------------------------
}
