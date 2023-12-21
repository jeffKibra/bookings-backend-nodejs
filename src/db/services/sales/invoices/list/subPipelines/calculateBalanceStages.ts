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
        foreignField: 'paidInvoices.invoiceId',
        let: { invoice_id: '$_id' },
        pipeline: [
          {
            $match: {
              'metaData.status': 0,
              'metaData.orgId': orgId,
            },
          },
          {
            $unwind: '$paidInvoices',
          },
          {
            $match: {
              $expr: {
                $eq: ['$paidInvoices.invoiceId', '$$invoice_id'],
              },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: '$paidInvoices.amount',
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
          $subtract: ['$total', '$paymentsTotal.total'],
        },
        paymentsTotal: '$paymentsTotal.total',
      },
    },
  ];
}
