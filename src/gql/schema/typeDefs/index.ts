import vehiclesTypeDefs from './vehicles';
import bookingsTypeDefs from './bookings';

const mainTypeDefs = `#graphql
    type SortParams{
        field:String,
        direction:String
    }
    type SearchMetaCount{
        lowerBound:Int
    }
    type SearchMeta {
        count:SearchMetaCount
    }

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
