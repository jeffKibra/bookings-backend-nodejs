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
    }
   
    extend type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!):String
    }
`;

export default typeDefs;
