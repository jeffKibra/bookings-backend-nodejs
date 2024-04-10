import { generateQueryStringFilter, generateRangeFilter } from '.';
import StaticFilters from './StaticFilters';
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
type IDynamicFiltersOptions = Record<string, IDynamicFilter>;

export default class SearchFilters extends StaticFilters {
  //
  dynamicFiltersOptions: IDynamicFiltersOptions;

  //
  searchFilters: Record<string, unknown>[] = [];
  matchFilters: Record<string, unknown> = {};
  //
  orgId: string;
  userFilters?: Record<string, (string | number | Date)[]>;
  //
  query: string;

  constructor(
    orgId: SearchFilters['orgId'],
    query: SearchFilters['query'],
    dynamicFiltersOptions: SearchFilters['dynamicFiltersOptions']
  ) {
    super(orgId);
    //
    this.query = query;
    this.orgId = orgId;
    this.dynamicFiltersOptions = dynamicFiltersOptions;
  }

  generateFilters(
    userFilters?: Parameters<SearchFilters['generateDynamicFilters']>[0]
  ) {
    this.generateStaticFilters();
    this.generateDynamicFilters(userFilters);

    const { matchFilters, searchFilters } = this;

    console.log('match filters', matchFilters);
    console.log('search filters', searchFilters);

    const filters = { searchFilters, matchFilters };

    return filters;
  }

  generateStaticFilters() {
    const { query, orgId } = this;

    const { matchFilters, searchFilters } =
      Filters.generateStaticFilters(orgId);

    if (query) {
      this.searchFilters = searchFilters;
    } else {
      this.matchFilters = matchFilters;
    }
  }

  generateDynamicFilters(userFilters?: IUserFilters) {
    if (userFilters && typeof userFilters === 'object') {
      const { dynamicFiltersOptions } = this;
      const dynamicFieldPaths = Object.keys(dynamicFiltersOptions);

      Object.keys(dynamicFieldPaths).forEach(field => {
        const values = userSearchFilters[field];

        if (Array.isArray(values) && values.length > 0) {
          this.appendFilter(field, values);
        }
      });
    }
  }

  appendFilter(field: string, values: IUserFiltersValues) {
    const { dynamicFiltersOptions } = this;

    const fieldType = dynamicFiltersOptions[field].type;
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
    this.matchSearchFilters[field] = filter;
  }

  appendSearchFilter(filter: {}) {
    return this.searchFilters.push(filter);
  }

  getFieldPath(field: string) {
    const { dynamicFiltersOptions } = this;

    return dynamicFiltersOptions[field].path;
  }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------
  static generateStaticFilters(orgId: string) {
    const orgIdPath = fieldPaths.orgId;
    const statusPath = fieldPaths.status;

    const searchFilters = [
      {
        text: {
          path: orgIdPath,
          query: orgId,
        },
      },
      {
        equals: {
          path: statusPath,
          value: 0,
        },
      },
    ];

    const matchFilters = {
      [orgIdPath]: orgId,
      [statusPath]: Filters.status,
    };

    return {
      searchFilters,
      matchFilters,
    };
  }

  //--------------------------------------------------------------------
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
