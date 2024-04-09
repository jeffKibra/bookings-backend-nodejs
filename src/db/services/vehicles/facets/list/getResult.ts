import { PipelineStage } from 'mongoose';
import { VehicleModel } from '../../../../models';
//

//
import { Filters } from '../../search/utils/filters';

//
import {
  IVehicle,
  IVehicleSearchAggregationMeta,
  ISearchVehiclesQueryOptions,
} from '../../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

//----------------------------------------------------------------

//----------------------------------------------------------------

export default async function getResult(orgId: string) {
  // aggregation to fetch items not booked.
  const { searchFilters } = Filters.generateStaticFilters(orgId);
  console.log('search filters', searchFilters);

  return VehicleModel.aggregate<IVehicleSearchAggregationMeta>([
    {
      $search: {
        facet: {
          operator: {
            compound: {
              filter: searchFilters,
            },
          },
          facets: {
            // makesFacet: {
            //   type: 'string',
            //   path: 'model.make',
            // },
            modelsFacet: {
              type: 'string',
              path: 'model.name',
            },
            typesFacet: {
              type: 'string',
              path: 'model.type',
            },
            colorsFacet: {
              type: 'string',
              path: 'color',
            },
          },
        },
      },
    },
    {
      $facet: {
        makes: [
          {
            $group: {
              _id: '$model.make',
              count: { $sum: 1 },
              models: {
                $addToSet: '$model.name',
              },
              years: {
                $addToSet: '$year',
              },
            },
          },
        ],
        ratesRange: [
          {
            $group: {
              _id: null,
              max: { $max: '$rate' },
              min: { $min: '$rate' },
            },
          },
        ],
        meta: [
          {
            //must be used before a lookup
            $replaceWith: {
              $mergeObjects: '$$SEARCH_META',
            },
          },
          {
            $limit: 1,
          },
        ],
      },
    },
    // {
    //   //restructure for all fields to be in root doc
    //   $replaceRoot: {
    //     newRoot: {
    //       $mergeObjects: [{ $arrayElemAt: ['$info', 0] }, '$$ROOT'],
    //     },
    //   },
    // },
    // {
    //   $project: {
    //     info: 0,
    //   },
    // },
    {
      //change meta field from array to object
      $set: {
        meta: { $arrayElemAt: ['$meta', 0] },
      },
    },
    {
      //format metadata
      $project: {
        count: '$meta.count.lowerBound',
        facets: {
          $mergeObjects: [
            {
              makes: [],
              models: [],
              types: [],
              colors: [],
              ratesRange: {},
            },
            {
              // makes: '$meta.facet.makesFacet.buckets',
              // models: '$meta.facet.modelsFacet.buckets',
              makes: '$makes',
              models: '$meta.facet.modelsFacet.buckets',
              types: '$meta.facet.typesFacet.buckets',
              colors: '$meta.facet.colorsFacet.buckets',
              ratesRange: {
                $arrayElemAt: ['$ratesRange', 0],
              },
            },
          ],
        },
      },
    },
  ]);
}
