import { MetaDataSharedFields, SearchMetaCommonFields } from './templates';

const contactSharedFields = `
   type: String
  salutation: String
  firstName: String
  lastName: String
  companyName: String
  displayName: String
  email: String
  phone: String
  website: String
  remarks: String
    openingBalance: Float
`;

const typeDefs = `

    type ContactMetaData {
        ${MetaDataSharedFields}
        group: String!
    }

    input ContactInput {
        ${contactSharedFields}
        billingAddress: AddressInput
        shippingAddress: AddressInput
        paymentTerm: PaymentTermInput
    }

    type Contact {
        ${contactSharedFields}
        _id:ID!
        billingAddress: Address
        shippingAddress: Address
        paymentTerm: PaymentTerm!
        searchScore:Float
        metaData: ContactMetaData
    }

    type SearchContactsMetaData {
        ${SearchMetaCommonFields}
    }

    type ContactsSearchResult {
        list: [Contact]
        meta: SearchContactsMetaData
    }

    input ContactsFilters {
        group: String
        type: String
        salutation: [String]
    }

    input ContactsQueryOptions {
        sortBy:[String!]
        pagination:Pagination
        filters:ContactsFilters
        group: String
    }

    type AutoCompleteContactSuggestion {
        _id:String
        type: String
        firstName: String
        lastName: String
        companyName: String
        displayName: String
        paymentTerm: PaymentTerm
        searchScore:Float
    }


    extend type Query {
        contact(id:ID!):Contact
        getContactSuggestions(query:ID, contactGroup:String): [AutoCompleteContactSuggestion]
        searchContacts(query:ID, queryOptions:ContactsQueryOptions):ContactsSearchResult!
    }

    extend type Mutation {
        createContact(contactGroup:String!, formData:ContactInput!):String
        createCustomer(formData:ContactInput!):String
        updateContact(id:ID!, formData:ContactInput!):Contact
        deleteContact(id:ID!): String
    }
`;

export default typeDefs;
