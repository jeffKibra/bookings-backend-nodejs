import { OrgMetaDataFields } from './templates';

//

//
const OrgSharedFields = `
    name:String!
    businessType: BusinessType!
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
    }

    type Org {
        ${OrgSharedFields}
        address: Address!
        metaData: OrgMetaData!
        _id:ID!
        id:String
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
