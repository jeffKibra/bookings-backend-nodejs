import { PipelineStage } from 'mongoose';
import { BookingModel, InvoiceModel } from '../../../../models';
//
import { generateSearchStages, calculateBalanceStages } from './subPipelines';
import { pagination, sort } from '../../../utils';
import { generateSortBy } from './utils';
//
import { IInvoice, IInvoicesQueryOptions } from '../../../../../types';
//

// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

const { generateLimit } = pagination;
//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  options?: IInvoicesQueryOptions,
  retrieveFacets?: boolean
) {
  const pagination = options?.pagination;
  //   console.log('pagination', pagination);
  const filters = options?.filters;
  const customerId = options?.customerId || '';
  const paymentId = options?.paymentId || '';

  console.log('list invoices getResult fn options', options);
  console.log('list invoices getResult fn filters', filters);

  const searchPipelineStages = generateSearchStages(orgId, customerId, {
    ...filters,
  });

  const balanceStages = calculateBalanceStages(orgId, paymentId);

  const page = pagination?.page || 0;
  const limit = generateLimit(pagination);
  const offset = Number(page) * limit;
  // console.log({ offset, limit, page });

  const [sortByField, sortByDirection] = generateSortBy(
    paymentId,
    options?.sortBy
  );

  return InvoiceModel.aggregate<{
    invoices: IInvoice[];
    meta: {
      count: number;
    };
  }>([
    ...searchPipelineStages,
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
      $set: {
        count: { $arrayElemAt: ['$count', 0] },
      },
    },
    {
      //format metadata
      $project: {
        invoices: 1,
        meta: {
          count: '$count.value',
        },
      },
    },
  ]);
}
