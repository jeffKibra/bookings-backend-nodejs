import { MetaDataSharedFields } from './templates';

//
const VehicleModelSharedFields = `
    name: String!
    make: String!
    type: String!
`;
//

//
const typeDefs = `#graphql

    

    input VehicleModelInput {
        ${VehicleModelSharedFields}
    } 

    type VehicleModelMetaData {
       ${MetaDataSharedFields}
    }

    type VehicleModel {
        ${VehicleModelSharedFields}
        _id: ID! 
        metaData: VehicleModelMetaData! 
    } 
    
    type VehicleMake {
        name: String!
        models: [VehicleModel]!
        metaData: VehicleModelMetaData
    }

    extend type Query {
        vehicleMakes: [VehicleMake]
        vehicleMake(id: ID!): VehicleMake
        vehicleModel(id: ID!): VehicleModel
    }
   
    extend type Mutation {
        createVehicleModel(make: String!, formData: VehicleModelInput!):String
        updateVehicleModel(make: String!, id: ID!, formData: VehicleModelInput!):VehicleModel
        deleteVehicleModel(make: String!, id: ID!): String
    }
`;

export default typeDefs;
