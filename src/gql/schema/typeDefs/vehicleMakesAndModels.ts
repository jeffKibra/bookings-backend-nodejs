import { MetaDataSharedFields } from './templates';

//
export const vehicleModelSharedFields = `
    name: String!
    make: String!
    type: String!
`;

export const vehicleModelSummaryFields = `
    ${vehicleModelSharedFields}
    year: Int!
`;

const vehicleModelFields = `
    ${vehicleModelSharedFields}
    years: String!
`;
//

//
const typeDefs = `#graphql

    input SelectedVehicleModelAsInput {
        ${vehicleModelSummaryFields}
    }

    type SelectedVehicleModel {
        ${vehicleModelSharedFields}
    }

    type VehicleModelMetaData {
       ${MetaDataSharedFields}
    }

    input VehicleModelInput {
        ${vehicleModelFields}
    } 

    type VehicleModel {
        ${vehicleModelFields}
        _id: ID! 
        metaData: VehicleModelMetaData! 
    } 
    
    type VehicleMake {
        _id: ID!
        name: String!
        models: [VehicleModel]!
        metaData: VehicleModelMetaData
    }

    extend type Query {
        vehicleMakes: [VehicleMake]
        vehicleMake(id: ID!): VehicleMake
        vehicleModel(makeId: ID!, id: ID!): VehicleModel
    }
   
    extend type Mutation {
        createVehicleModel(makeId: ID!, formData: VehicleModelInput!):String
        updateVehicleModel(makeId: ID!, id: ID!, formData: VehicleModelInput!):VehicleMake
        deleteVehicleModel(makeId: ID!, id: ID!): String
    }
`;

export default typeDefs;
