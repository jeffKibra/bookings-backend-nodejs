import { PipelineStage } from 'mongoose';
import {} from 'mongodb';

export default function generateAvailableItemsStages(
  orgId: string,
  selectedDates?: string[]
) {
  let stages: PipelineStage[] = [];

  if (Array.isArray(selectedDates) && selectedDates.length > 0) {
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
                  $in: [...selectedDates],
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
        },
      },
    ];
  }

  return [];
}
