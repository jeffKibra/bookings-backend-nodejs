const typeDefs = `#graphql
    type MetaData {
        orgId: String!
        createdBy: String!
        createdAt: Int!
        modifiedBy: String!
        modifiedAt: Int!
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
        id: String! 
        metaData: MetaData! 
    }
    
    type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
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

    type Mutation {
        createVehicle(input:VehicleInput!):String
        updateVehicle(vehicleId:String!, input:VehicleInput!, ):String
        deleteVehicle(vehicleId:String!):String

    }
`;

export default typeDefs;
