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
        _id:ID!
        taxes: [Tax]
        paymentTerms:[PaymentTerm!]!
        paymentModes:[PaymentMode!]!
        metaData: OrgMetaData!
    }

    
    extend type Query {
        org(id:ID): Org
        userOrg:Org
    }
   
    extend type Mutation {
        createOrg(formData:OrgInput!):Org
        updateOrg(id:ID!, formData:OrgInput!):Org
        deleteOrg(id:ID!):String
    }
`;

export default typeDefs;
