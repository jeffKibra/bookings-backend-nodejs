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
        _id: String! 
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
        createVehicle(formdata:VehicleInput!):String
        updateVehicle(id:String!, formData:VehicleInput!, ):String
        deleteVehicle(id:String!):String

    }
`;

export default typeDefs;
