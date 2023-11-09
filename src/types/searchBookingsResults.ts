import { ISearchMetaCount, ICountFacet, INumRange } from './searchResults';

export interface IBookingMakeAggregationFacet {
  _id: string;
  count: number;
  models: string[];
  years?: number[];
}

export interface IBookingMakeFacet
  extends Omit<IBookingMakeAggregationFacet, 'models'> {
  models: ICountFacet[];
}

export interface IBookingAggregationFacets {
  makes: IBookingMakeAggregationFacet[];
  models: ICountFacet[];
  colors: ICountFacet[];
  types: ICountFacet[];
  ratesRange: INumRange;
}

export interface IBookingFacets
  extends Omit<IBookingAggregationFacets, 'makes' | 'models'> {
  makes: IBookingMakeFacet[];
}
export interface IBookingSearchAggregationMeta {
  count: ISearchMetaCount;
  facets: IBookingAggregationFacets;
}

export interface IBookingSearchMeta
  extends Omit<IBookingSearchAggregationMeta, 'facets'> {
  facets: IBookingFacets;
}
