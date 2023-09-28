interface ISortOptions {
  field: string;
  direction?: 'desc' | 'asc';
}

export interface IPaginationCursor {
  _id: string;
  field: 'string';
  value: string | number;
  isNumber?: boolean;
}

export interface IPaginationFoward {
  after: IPaginationCursor;
}

export interface IPaginationBackwards {
  before: IPaginationCursor;
}

export type IPaginationDirection = IPaginationFoward | IPaginationBackwards;

export interface IPaginationRoot {
  limit: number;
  currentPage: number;
}
export type IPaginationParams = IPaginationRoot & IPaginationDirection;

export interface IPaginationOptions {
  limit: number;
  fowardCursor: IPaginationCursor | null;
  backwardCursor: IPaginationCursor | null;
}
