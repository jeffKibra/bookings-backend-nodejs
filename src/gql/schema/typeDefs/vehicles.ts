import { MetaDataSharedFields, SearchMetaCommonFields } from './templates';

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
        facets:VehicleFacets
    }

    

    type VehiclesSearchResult {
        vehicles: [Vehicle]!
        meta:SearchVehicleMetaData
    }

    input VehicleFilters {
        make:[String]
        model:[String]
        type:[String]
        color:[String]
        rate:[Int]
    }

    input VehicleInput {
        ${vehicleInputFields}
    }

    input VehiclesQueryOptions {
        sortBy:SortByInput
        pagination:Pagination
        selectedDates:[String]
        filters:VehicleFilters
    }

    
   
    extend type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
        searchVehicles(query:ID, queryOptions:VehiclesQueryOptions):VehiclesSearchResult
        findVehiclesNotBookedInSelectedDates(selectedDates:[String!]!):[Vehicle]
    }
   
    extend type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!):String
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
