export interface ISearchMetaCount {
  lowerBound: number;
}

export interface ICountFacet {
  _id: string;
  count: number;
}

interface INumRange {
  min: number;
  max: number;
}

export interface IVehicleMakeAggregationFacet {
  _id: string;
  count: number;
  models: string[];
  years?: number[];
}

export interface IVehicleMakeFacet
  extends Omit<IVehicleMakeAggregationFacet, 'models'> {
  models: ICountFacet[];
}

export interface IVehicleAggregationFacets {
  makes: IVehicleMakeAggregationFacet[];
  models: ICountFacet[];
  colors: ICountFacet[];
  types: ICountFacet[];
  ratesRange: INumRange;
}

export interface IVehicleFacets
  extends Omit<IVehicleAggregationFacets, 'makes' | 'models'> {
  makes: IVehicleMakeFacet[];
}
export interface IVehicleSearchAggregationMeta {
  count: ISearchMetaCount;
  facets: IVehicleAggregationFacets;
}

export interface IVehicleSearchMeta
  extends Omit<IVehicleSearchAggregationMeta, 'facets'> {
  facets: IVehicleFacets;
}
