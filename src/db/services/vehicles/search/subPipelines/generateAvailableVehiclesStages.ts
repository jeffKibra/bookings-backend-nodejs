import { PipelineStage } from 'mongoose';
import {} from 'mongodb';

export default function generateAvailableItemsStages(
  orgId: string,
  selectedDates?: string[]
) {
  let stages: PipelineStage[] = [];

  let userSelectedDates: string[] = [];
  if (Array.isArray(selectedDates)) {
    userSelectedDates = selectedDates;
  }

  return [
    {
      $addFields: {
        vehicleId: {
          $toString: '$_id',
        },
      },
    },
    {
      $lookup: {
        from: 'bookings',
        localField: 'vehicleId',
        foreignField: 'vehicle._id',
        pipeline: [
          {
            $match: {
              'metaData.status': 0,
              'metaData.orgId': orgId,
              selectedDates: {
                $in: [...userSelectedDates],
              },
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
