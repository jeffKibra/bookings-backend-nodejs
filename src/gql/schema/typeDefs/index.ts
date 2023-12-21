import orgsTypeDefs from './orgs';
import vehiclesTypeDefs from './vehicles';
import salesTypeDefs from './sales';
import contactsTypeDefs from './contacts';

import {
  SearchMetaCommonFields,
  AddressFields,
  AccountCommonFields,
  AccountInputCommonFields,
  AccountTypeFields,
} from './templates';

const paymentTermFormFields = `
    name:String!
    days:Int!
`;

const paymentTermFields = `
    ${paymentTermFormFields}
    _id:String!
`;

const paymentModeFormFields = `
    name:String!
`;
const paymentModeFields = `
    ${paymentModeFormFields}
    _id:String!
`;

//
export const AccountInputFields = `
    ${AccountCommonFields}
`;

export const AccountFields = `
    ${AccountCommonFields}
`;

const mainTypeDefs = `#graphql
    input AccountTypeInput {
        ${AccountTypeFields}
    }
    type AccountType {
        ${AccountTypeFields}
    }

    input SelectedAccountInput {
        ${AccountInputCommonFields}
    }
    type SelectedAccount {
        ${AccountCommonFields}
    }

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
        name: String
        value: String
    }

    input BusinessTypeInput {
        name: String
        value: String
    }

    type PaymentTerm {
        ${paymentTermFields}
    }
    input PaymentTermInput {
        ${paymentTermFields}
    }
    input PaymentTermForm {
        ${paymentTermFormFields}
    }

    type PaymentMode {
        ${paymentModeFields}
    }
    input PaymentModeInput {
        ${paymentModeFields}
    }
    input PaymentModeForm {
        ${paymentModeFormFields}
    }

    type Tax {
        _id:String
        name:String!
        rate:Int!
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

const typeDefs = [
  mainTypeDefs,
  orgsTypeDefs,
  vehiclesTypeDefs,
  contactsTypeDefs,
  ...salesTypeDefs,
];

// const typeDefs = vehiclesTypeDefs;

export default typeDefs;
