export interface ISearchMetaCount {
  lowerBound: number;
}

type ISortByCountFacetCategory = Record<string, string | number>;
type ISortByCountFacetCategories = ISortByCountFacetCategory[];

interface INumRange {
  min: number;
  max: number;
}
export interface ISearchMeta {
  count: ISearchMetaCount;
  facets: {
    makesFacet: ISortByCountFacetCategories;
    modelsFacet: ISortByCountFacetCategories;
    colorsFacet: ISortByCountFacetCategories;
    typesFacet: ISortByCountFacetCategories;
    ratesRangeFacet: INumRange;
  };
}
