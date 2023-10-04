import vehiclesTypeDefs from './vehicles';
import bookingsTypeDefs from './bookings';

import { SearchMetaCommonFields } from './templates';

const mainTypeDefs = `#graphql
    input SortByInput{
        field:String
        direction:String
    }
    type SearchMetaCount{
        lowerBound:Int
    }
    type SearchMeta {
        ${SearchMetaCommonFields}
    }

    type CountFacet {
        _id:String
        count:Int
    }
    
    type RangeFacet {
        min:Int
        max:Int
    }


    input PaginationCursor {
        _id: String
        field: String
        value: String
        isNumber: Boolean
    }

    input Pagination {
        page: Int
        limit: Int
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
