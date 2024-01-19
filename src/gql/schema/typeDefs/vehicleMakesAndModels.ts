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
        ${vehicleModelSummaryFields}
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
        vehicleMake(name: String!): VehicleMake
        vehicleModel(make: String!, id: ID!): VehicleModel
    }
   
    extend type Mutation {
        createVehicleModel(formData: VehicleModelInput!):String
        updateVehicleModel(id: ID!, formData: VehicleModelInput!):VehicleMake
        deleteVehicleModel(make: String!, id: ID!): String
    }
`;

export default typeDefs;
