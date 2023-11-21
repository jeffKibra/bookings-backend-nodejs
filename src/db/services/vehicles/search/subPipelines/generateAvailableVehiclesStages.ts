import { PipelineStage } from 'mongoose';
import { ObjectId } from 'mongodb';
//
// type FacetPipelineStage = PipelineStage.FacetPipelineStage;

export default function generateAvailableItemsStages(
  orgId: string,
  selectedDates?: string[],
  bookingId?: string
) {
  // console.log('generateAvailableItemsStages fn', { selectedDates });
  let stages: PipelineStage[] = [];

  const userSelectedDates: string[] = Array.isArray(selectedDates)
    ? selectedDates
    : [];

  return [
    {
      $lookup: {
        from: 'invoices',
        localField: 'id',
        foreignField: 'items.0.itemId',
        pipeline: [
          {
            $match: {
              'metaData.status': 0,
              'metaData.orgId': orgId,
              'items.0.details.selectedDates': {
                $in: [...userSelectedDates],
              },
              ...(bookingId
                ? {
                    _id: {
                      $ne: new ObjectId(bookingId),
                    },
                  }
                : {}),
            },
          },
          {
            $limit: 1,
          },
        ],
        as: 'itemBookings',
      },
    },
    {
      $addFields: {
        similarBookings: {
          $size: '$itemBookings',
        },
      },
    },
    {
      $project: {
        itemBookings: 0,
      },
    },
    {
      $match: {
        similarBookings: 0,
        'metaData.status': 0,
      },
    },
  ];
}
