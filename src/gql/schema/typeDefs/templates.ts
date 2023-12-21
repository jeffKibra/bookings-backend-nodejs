export const OrgMetaDataFields = `
    createdBy: String!
    createdAt: String!
    modifiedBy: String!
    modifiedAt: String!
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

export const AccountTypeFields = `
    name: String!
    main: String!
    _id: String!
`;

export const AccountSharedFields = `
    _id: String!
    name: String!
    accountId: String!
    description: String
`;

export const AccountInputCommonFields = `
    ${AccountSharedFields}
    accountType: AccountTypeInput

`;

export const AccountCommonFields = `
    ${AccountSharedFields}
    accountType: AccountType
`;
