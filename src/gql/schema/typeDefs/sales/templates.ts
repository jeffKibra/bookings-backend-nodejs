export const contactSummaryFields = `
    _id: ID!
    displayName:String!
`;
export const paymentModeFields = `
    name:String!
    value:String!
`;

export const paymentTermFields = `
    name: String!
    value: String!
    days: Int!
`;

export const downPaymentSharedFields = `
    amount:Int!
    reference:String
`;

//
export const saleItemDetailsSharedFields = `
  taxType: String
  selectedDates: [String]
  startDate: String
  endDate: String
`;
export const saleItemDetailsFields = `
  ${saleItemDetailsSharedFields}
  item: VehicleForBooking
`;
export const saleItemDetailsInputFields = `
  ${saleItemDetailsSharedFields}
  item: VehicleForBookingInput
`;

export const saleItemSharedFields = `
    itemId: String!
    name: String!
    description: String
    rate: Int!
    qty: Int!
    subTotal: Int!
    tax: Int
    total: Int!
    salesAccountId: String
`;
export const saleItemFields = `
    ${saleItemSharedFields}
    details: SaleItemDetails
`;

export const saleItemInputFields = `
    ${saleItemSharedFields}
    details: SaleItemDetailsInput
`;

//

//   customer: ContactSummary;
export const saleSharedFields = `
  saleDate: String
  taxType: String
  discount: Int
  taxes: [String]
  totalTax: Int
  subTotal: Int!
  total: Int!
`;

export const saleInputFields = `
    ${saleSharedFields}
    items: [SaleItemInput]!
`;

export const saleFields = `
    ${saleSharedFields}
    items: [SaleItem]!
`;
