export const OrgMetaDataFields = `
    createdBy: String!
    createdAt: Int!
    modifiedBy: String!
    modifiedAt: Int!
    status:Int!
`;

export const MetaDataSharedFields = `
    ${OrgMetaDataFields}
    orgId: String!
`;

export const ListMetaCommonFields = `
    count:Int
    page:Int
`;

export const SearchMetaCommonFields = `
    ${ListMetaCommonFields}
`;

export const AddressFields = `
  city: String
  country: String
  postalCode: String
  state: String
  street: String
`;
