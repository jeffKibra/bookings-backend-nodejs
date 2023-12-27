import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

export default function calculateBalanceStages(orgId: string) {
  // console.log('calculateBalanceStages fn', { selectedDates });
  let stages: PipelineStage[] = [];

  return [
    {
      $lookup: {
        from: 'received_payments',
        localField: '_id',
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
            $group: {
              _id: null,
              total: {
                $sum: '$allocations.amount',
              },
            },
          },
        ],
        as: 'paymentsTotal',
      },
    },
    {
      $set: {
        paymentsTotal: {
          $arrayElemAt: ['$paymentsTotal', 0],
        },
      },
    },
    {
      $set: {
        balance: {
          $subtract: [
            '$total',
            { $ifNull: ['$paymentsTotal.total', 0] },
            // '$paymentsTotal.total',
          ],
        },
        paymentsTotal: { $ifNull: ['$paymentsTotal.total', 0] },
      },
    },
  ];
}
