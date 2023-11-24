import { OrgMetaDataFields } from './templates';

//

//
const OrgSharedFields = `
    name:String!
    industry: String
    phone: String
    website: String
`;

const typeDefs = `#graphql
    type OrgMetaData {
        ${OrgMetaDataFields}
    }

    input OrgInput {
        ${OrgSharedFields}
        address: AddressInput!
        businessType: BusinessTypeInput!
    }

    type Org {
        ${OrgSharedFields}
        address: Address!
        businessType: BusinessType!
        metaData: OrgMetaData!
        _id:ID!
        id:String
         taxes: [Tax]
        paymentTerms:[PaymentTerm!]!
        paymentModes:[PaymentMode!]!
       
    }

    
    extend type Query {
        org(id:ID): Org
    }
   
    extend type Mutation {
        createOrg(formData:OrgInput!):String
        updateOrg(id:ID!, formData:OrgInput!):Org
        deleteOrg(id:ID!):String
    }
`;

export default typeDefs;
