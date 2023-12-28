import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

// type ppp = PipelineStage.Facet
//

export default function calculateBalanceStages(
  orgId: string,
  paymentId?: string
) {
  // console.log('calculateBalanceStages fn', { selectedDates });
  let stages: PipelineStage[] = [];

  return [
    {
      $lookup: {
        from: 'received_payments',
        localField: '_id',
        // localField: { $toString: '_id' },
        foreignField: 'allocations.ref',
        let: { invoice_id: '$_id' },
        pipeline: [
          {
            $match: {
              'metaData.status': 0,
              'metaData.orgId': orgId,
            },
          },
          {
            $unwind: '$allocations',
          },
          {
            $match: {
              $expr: {
                $eq: ['$allocations.ref', '$$invoice_id'],
              },
            },
          },
          {
            $facet: {
              total: [
                {
                  $group: {
                    _id: null,
                    value: {
                      $sum: '$allocations.amount',
                    },
                  },
                },
              ],
              paymentAllocation: [
                {
                  $match: {
                    $expr: {
                      $eq: [{ $toString: '$_id' }, paymentId],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $replaceWith: {
                    $mergeObjects: [{ ref: '', amount: 0 }, '$allocations'],
                  },
                },
              ],
            },
          },
          {
            $set: {
              total: {
                $getField: {
                  input: { $arrayElemAt: ['$total', 0] },
                  field: 'value',
                },
              },
              paymentAllocation: {
                $getField: {
                  input: { $arrayElemAt: ['$paymentAllocation', 0] },
                  field: 'amount',
                },
              },
            },
          },
        ],
        as: 'allocationsResult',
      },
    },
    {
      $set: {
        allocationsResult: {
          $arrayElemAt: ['$allocationsResult', 0],
        },
      },
    },
    {
      $set: {
        totalTax: {
          $toDouble: '$totalTax',
        },
        subTotal: {
          $toDouble: '$subTotal',
        },
        total: {
          $toDouble: '$total',
        },
        //
        // balance: {
        //   $toDouble: {
        //     $subtract: [
        //       '$total',
        //       { $ifNull: ['$allocationsResult.total', 0] },
        //       // '$allocationsResult.total',
        //     ],
        //   },
        // },
        balance: {
          $toDouble: {
            $subtract: [
              '$total',
              {
                $subtract: [
                  { $ifNull: ['$allocationsResult.total', 0] },
                  { $ifNull: ['$allocationsResult.paymentAllocation', 0] },
                ],
              },
              // '$allocationsResult.total',
            ],
          },
        },
        allocationsTotal: {
          $toDouble: {
            $ifNull: ['$allocationsResult.total', 0],
          },
        },
        paymentAllocation: {
          $toDouble: {
            $ifNull: ['$allocationsResult.paymentAllocation', 0],
          },
        },
      },
    },
  ];
}
