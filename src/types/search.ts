import { IPaginationParams } from './pagination';
import { IUserSortBy } from './sortBy';

export interface ISearchQueryOptions {
  sortBy?: IUserSortBy;
  pagination?: IPaginationParams;
  filters?: Record<string, (string | number | Date)[]>;
}
