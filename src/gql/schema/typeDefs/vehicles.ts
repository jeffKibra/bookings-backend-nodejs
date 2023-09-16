import { MetaDataSharedFields } from './templates';

//
const typeDefs = `#graphql
    type VehicleMetaData {
       ${MetaDataSharedFields}
    }

    type Vehicle {
        registration: String! 
        rate: Int!
        make: String! 
        model: String! 
        year: Int!
        type: String! 
        color: String! 
        description: String 
        _id: ID! 
        metaData: VehicleMetaData! 
    }

    input VehicleInput {
        registration: String! 
        rate: Int!
        make: String! 
        model: String! 
        year: Int!
        type: String! 
        color: String! 
        description: String 
    }
   
    extend type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
    }
   
    extend type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!):String
    }
`;

export default typeDefs;
