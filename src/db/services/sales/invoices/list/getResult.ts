import { PipelineStage } from 'mongoose';
import { BookingModel, InvoiceModel } from '../../../../models';
//
import { generateSearchStages } from './subPipelines';
import { pagination, sort } from '../../../utils';
//
import { IInvoice, IInvoicesQueryOptions } from '../../../../../types';
//

// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

const { generateSortBy } = sort;
const { generateLimit } = pagination;
//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  options?: IInvoicesQueryOptions,
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
  console.log({ offset, limit, page });

  // aggregation to fetch items not booked.
  // <{
  //   invoices: IInvoice[];
  //   meta: {
  //     count: number;
  //   };
  // }>
  return InvoiceModel.aggregate<{
    invoices: IInvoice[];
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
    {
      $set: {
        id: {
          $toString: '$_id',
        },
        totalTax: {
          $toDouble: '$totalTax',
        },
        subTotal: {
          $toDouble: '$subTotal',
        },
        total: {
          $toDouble: '$total',
        },
      },
    },
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
