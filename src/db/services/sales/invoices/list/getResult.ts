import { PipelineStage } from 'mongoose';
import { InvoiceModel } from '../../../../models';
//
import { InvoicesFilters } from '../../../utils/filters';
//
import { generateSearchStages, calculateBalanceStages } from './subPipelines';
import { pagination, sort } from '../../../utils';
import { generateSortBy } from './utils';
//
import { IInvoice, IInvoicesQueryOptions } from '../../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

const { generateLimit } = pagination;
//----------------------------------------------------------------

function generateAggregationOptions(
  orgId: string,
  options?: IInvoicesQueryOptions
) {
  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;
  const customerId = options?.customerId || '';
  const paymentId = options?.paymentId || '';

  console.log('list invoices getResult fn options', options);
  console.log('list invoices getResult fn filters', filters);

  const userFilters = {
    ...filters,
    customerId: [customerId],
  };

  const { matchFilters, searchFilters } = new InvoicesFilters(
    orgId
  ).generateFilters('', userFilters);

  const searchPipelineStages = searchFilters
    ? generateSearchStages('', searchFilters)
    : null;

  const matchPipelineStage: FacetPipelineStage = {
    $match: {
      ...matchFilters,
    },
  };

  const balanceStages = calculateBalanceStages(orgId, paymentId);

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  // console.log({ offset, limit, page });

  const [sortByField, sortByDirection] = generateSortBy(
    paymentId,
    options?.sortBy
  );

  return {
    searchPipelineStages,
    matchPipelineStage,
    balanceStages,
    offset,
    limit,
    sortByField,
    sortByDirection,
  };
}

//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  options?: IInvoicesQueryOptions
) {
  const {
    sortByField,
    sortByDirection,
    searchPipelineStages,
    matchPipelineStage,
    balanceStages,
    offset,
    limit,
  } = generateAggregationOptions(orgId, options);

  return InvoiceModel.aggregate<{
    invoices: IInvoice[];
    meta: {
      count: number;
    };
  }>([
    // ...(query ? searchPipelineStages : [matchPipelineStage]),
    matchPipelineStage,

    // {
    //   $match: {
    //     'metaData.status': 0,
    //     'metaData.orgId': orgId,
    //   },
    // },

    // {
    //   $set: {
    //     _id: {
    //       $toString: '$_id',
    //     },
    //   },
    // },

    ...balanceStages,

    {
      $sort: {
        [sortByField]: sortByDirection,
        _id: sortByDirection,
      },
    },

    {
      $facet: {
        invoices: [
          {
            $skip: offset,
          },
          {
            //limit items returned
            $limit: limit,
          },
        ],
        count: [
          {
            $count: 'value',
          },
        ],
      },
    },
    {
      //change count field from array to object
      $project: {
        invoices: 1,
        meta: {
          count: {
            $getField: {
              input: { $arrayElemAt: ['$count', 0] },
              field: 'value',
            },
          },
        },
      },
    },
    // {
    //   //change count field from array to object
    //   $set: {
    //     count: {
    //       $getField: {
    //         input: { $arrayElemAt: ['$count', 0] },
    //         field: 'value',
    //       },
    //     },
    //   },
    // },
    // {
    //   //format metadata
    //   $project: {
    //     invoices: 1,
    //     meta: {
    //       count: '$count.value',
    //     },
    //   },
    // },
  ]);
}
