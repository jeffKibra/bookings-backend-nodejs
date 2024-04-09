import { MetaDataSharedFields, SearchMetaCommonFields } from './templates';

//

//
export const VehicleSharedFields = `
    registration: String! 
    rate: Int!
    color: String! 
    description: String
`;
export const VehicleFields = `
    ${VehicleSharedFields}
    model: SelectedVehicleModel! 
`;
export const VehicleInputFields = `
    ${VehicleSharedFields}
    model: SelectedVehicleModelAsInput! 
`;

//
const typeDefs = `#graphql

    type VehicleMetaData {
       ${MetaDataSharedFields}
    }

    type Vehicle {
        ${VehicleFields}
        _id: ID! 
        id:String
        searchScore:Float
        metaData: VehicleMetaData! 
    }

    type VehicleMakeFacet {
        _id:String
        count:Int
        models:[CountFacet]
    }

    type VehicleFacets {
        makes:[VehicleMakeFacet]
        types:[CountFacet]
        colors: [CountFacet]
        ratesRange: RangeFacet
    }

    type SearchVehicleMetaData {
        ${SearchMetaCommonFields}
    }

    type VehiclesSearchResult {
        list: [Vehicle]!
        meta:SearchVehicleMetaData
    }

    input VehicleFilters {
        make:[String]
        model:[String]
        type:[String]
        color:[String]
        rate:[Int]
    }

    input VehiclesQueryOptions {
        bookingId:String
        sortBy:[String!]
        pagination:Pagination
        selectedDates:[String]
        filters:VehicleFilters
    }

    input VehicleInput {
        ${VehicleInputFields}
    }
    
   
    extend type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
        vehicleFacets: VehicleFacets
        searchVehicles(query:ID, queryOptions:VehiclesQueryOptions):VehiclesSearchResult
        findVehiclesNotBookedInSelectedDates(selectedDates:[String!]!):[Vehicle]
    }
   
    extend type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!): String
    }
`;

export default typeDefs;

// findVehiclesNotBookedInSelectedDates(selectedDates:[String!]!):[Vehicle]

// valid aggregation to fetch items not booked.
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
//       from: 'bookings',
//       localField: 'vehicleId',
//       foreignField: 'vehicle._id',
//       pipeline: [
//         {
//           $match: {
//             'metaData.status': 0,
//             'metaData.orgId': 'org1',
//             selectedDates: {
//               $in: ['2023-Sep-17'],
//             },
//           },
//         },
//         {
//           $limit: 1,
//         },
//       ],
//       as: 'itemBookings',
//     },
//   },
//   {
//     $addFields: {
//       similarBookings: {
//         $size: '$itemBookings',
//       },
//     },
//   },
//   {
//     $project: {
//       itemBookings: 0,
//     },
//   },
//   {
//     $match: {
//       similarBookings: 0,
//     },
//   },
// ];
