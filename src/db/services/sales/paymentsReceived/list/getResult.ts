import { PipelineStage } from 'mongoose';
import { PaymentReceivedModel } from '../../../../models';
//
import { generateSearchStages } from './subPipelines';
import { pagination, sort } from '../../../utils';
//
import {
  IPaymentReceived,
  IPaymentsReceivedQueryOptions,
} from '../../../../../types';
//

// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

const { generateSortBy } = sort;
const { generateLimit } = pagination;
//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  options?: IPaymentsReceivedQueryOptions,
  retrieveFacets?: boolean
) {
  const [sortByField, sortByDirection] = generateSortBy('', options?.sortBy);

  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;

  // const searchPipelineStages = generateSearchStages(
  //   orgId,
  //   query,
  //   filters,
  //   retrieveFacets
  // );

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  // console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  // <{
  //   paymentsReceived: IPaymentReceived[];
  //   meta: {
  //     count: number;
  //   };
  // }>
  return PaymentReceivedModel.aggregate<{
    paymentsReceived: IPaymentReceived[];
    meta: {
      count: number;
    };
  }>([
    // ...searchPipelineStages,
    {
      $match: {
        'metaData.status': 0,
        'metaData.orgId': orgId,
      },
    },

    // {
    //   $set: {
    //     _id: {
    //       $toString: '$_id',
    //     },
    //     amount: {
    //       $toDouble: '$amount',
    //     },
    //     excess: {
    //       $toDouble: '$excess',
    //     },
    //   },
    // },

    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },

    {
      $facet: {
        paymentsReceived: [
          {
            $skip: offset,
          },
          {
            //limit items returned
            $limit: limit,
          },

          {
            $set: {
              _id: {
                $toString: '$_id',
              },
              amount: {
                $toDouble: '$amount',
              },
              excess: {
                $toDouble: '$excess',
              },
              paidInvoices: [],
            },
          },
        ],
        count: [
          {
            $count: 'value',
          },
        ],
        // meta: [
        //   {
        //     //must be used before a lookup
        //     $replaceWith: '$$SEARCH_META',
        //   },
        //   {
        //     $limit: 1,
        //   },
        // ], //use only if we have a search stage in the pipeline
      },
    },

    {
      //change count field from array to object
      $set: {
        count: { $arrayElemAt: ['$count', 0] },
      },
    },

    {
      //format metadata
      $project: {
        paymentsReceived: 1,
        meta: {
          // count: '$meta.count.lowerBound',//use only if is previously initialized
          count: '$count.value',
        },
      },
    },
  ]);
}
