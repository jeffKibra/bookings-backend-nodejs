import { MetaDataSharedFields } from './templates';

//
export const vehicleInputFields = `
    registration: String! 
    rate: Int!
    make: String! 
    model: String! 
    year: Int!
    type: String! 
    color: String! 
    description: String
`;
//
const typeDefs = `#graphql
    type VehicleMetaData {
       ${MetaDataSharedFields}
    }

    type Vehicle {
        ${vehicleInputFields}
        _id: ID! 
        metaData: VehicleMetaData! 
    }

    input VehicleInput {
        ${vehicleInputFields}
    }
   
    extend type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
        findVehiclesNotBookedInSelectedDates(selectedDates:[String!]!):[Vehicle]
    }
   
    extend type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!):String
    }
`;

export default typeDefs;

// [
//   {
//     $addFields: {
//       vehicleId: {
//         $toString: '$_id',
//       },
//     },
//   },
//   {
//     $lookup: {
//       from: 'item_yearly_bookings',
//       localField: 'vehicleId',
//       foreignField: 'itemId',
//       pipeline: [
//         {
//           $match: {
//             dates: {
//               $in: ['2023-Sep-17', '2024-Jan-05'],
//             },
//           },
//         },
//         {
//           $unwind: '$dates',
//         },
//         {
//           $count: 'allDatesCount',
//         },
//       ],
//       as: 'allBookings',
//     },
//   },
//   {
//     $replaceRoot: {
//       newRoot: {
//         $mergeObjects: [
//           {
//             allDatesCount: 0,
//           },
//           {
//             $arrayElemAt: ['$allBookings', 0],
//           },
//           '$$ROOT',
//         ],
//       },
//     },
//   },
//   {
//     $project: {
//       allBookings: 0,
//     },
//   },
//   {
//     $match: {
//       allDatesCount: 0,
//     },
//   },
//   {
//     $limit: 1,
//   },
// ];
