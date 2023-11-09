export interface IPaginationCursor {
  _id: string;
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
  page: number;
  // action?: 'PREV' | 'NEXT';
}
export type IPaginationParams = IPaginationRoot;

export interface IPaginationOptions {
  limit: number;
  fowardCursor: IPaginationCursor | null;
  backwardCursor: IPaginationCursor | null;
}
