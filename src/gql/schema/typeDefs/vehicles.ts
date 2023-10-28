import { MetaDataSharedFields, SearchMetaCommonFields } from './templates';

//
const VehicleModelFields = `
    model:String!
    make:String!
    type:String!
`;
//
export const VehicleSharedFields = `
    registration: String! 
    rate: Int!
    make: String! 
    year: String
    color: String! 
    description: String
`;
export const VehicleFields = `
    ${VehicleSharedFields}
    model: VehicleModel! 
`;
export const VehicleInputFields = `
    ${VehicleSharedFields}
    model: VehicleModelInput! 
`;

//
const typeDefs = `#graphql

    type VehicleModel {
        ${VehicleModelFields}
    } 
    input VehicleModelInput {
        ${VehicleModelFields}
    } 

    type VehicleMetaData {
       ${MetaDataSharedFields}
    }

    type Vehicle {
        ${VehicleFields}
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

    input VehicleModelInput{
        model:String!
        make:String!
        type:String!
    } 

    

    input VehiclesQueryOptions {
        sortBy:SortByInput
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
        searchVehicles(query:ID, queryOptions:VehiclesQueryOptions):VehiclesSearchResult
        findVehiclesNotBookedInSelectedDates(selectedDates:[String!]!):[Vehicle]
    }
   
    extend type Mutation {
        cv(reg:String!):String
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
