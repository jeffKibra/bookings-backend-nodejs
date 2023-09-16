import vehiclesTypeDefs from './vehicles';
import bookingsTypeDefs from './bookings';

export const MetaDataSharedFields = `
    orgId: String!
    createdBy: String!
    createdAt: Int!
    modifiedBy: String!
    modifiedAt: Int!
    status:Int!
`;

const mainTypeDefs = `#graphql
    type Query {
        _empty:String
    }

    type Mutation {
        _empty:String
    }
`;

const typeDefs = [mainTypeDefs, vehiclesTypeDefs, bookingsTypeDefs];

// const typeDefs = vehiclesTypeDefs;

export default typeDefs;
