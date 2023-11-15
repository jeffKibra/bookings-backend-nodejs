import vehiclesTypeDefs from './vehicles';
import bookingsTypeDefs from './bookings';

import { SearchMetaCommonFields, AddressFields } from './templates';

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

    type Address {
${AddressFields}
    }
    
    input AddressInput {
${AddressFields}
    }

    type BusinessType {
    name: string;
    value: string;
    }

    input BusinessTypeInput {
    name: string;
    value: string;
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
