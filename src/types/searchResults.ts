export interface ISearchMetaCount {
  lowerBound: number;
}

export interface ICountFacet {
  _id: string;
  count: number;
}

export interface INumRange {
  min: number;
  max: number;
}
