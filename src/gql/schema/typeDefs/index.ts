import vehiclesTypeDefs from './vehicles';
import bookingsTypeDefs from './bookings';

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
