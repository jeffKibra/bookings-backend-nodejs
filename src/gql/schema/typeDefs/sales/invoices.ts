import { MetaDataSharedFields, ListMetaCommonFields } from '../templates';
import { saleFields, saleInputFields } from './templates';

//
import { VehicleInputFields } from '../vehicles';

const invoiceSharedFields = `
    customerNotes:String
    dueDate:String!
`;

const invoiceInputFields = `
    ${saleInputFields}
    ${invoiceSharedFields}
    customer:ContactSummaryInput!
    paymentTerm:PaymentTermInput!
`;

//     payments: [InvoicePayment]
const invoiceFields = `
    ${saleFields}
    ${invoiceSharedFields}
    _id:ID!
    customer:ContactSummary!
    paymentTerm:PaymentTerm!
    balance:Int
    metaData:SaleMetaData!
`;

const typeDefs = `#graphql

    type InvoicePayment {
        paymentId: String!
        amount: Int!
    }

    input InvoiceVehicleInput {
        _id:ID!
        ${VehicleInputFields}
    
    }

    input InvoiceInput {
        ${invoiceInputFields}
    }

    type Invoice {
        ${invoiceFields}
    }

    type ListInvoicesMetaData {
        ${ListMetaCommonFields}
    }

    input InvoicesQueryOptions {
        customerId: String
        paymentId: String
        sortBy: [String!]
        pagination: Pagination
        filters: VehicleFilters
    }

    type InvoicesResult {
        list: [Invoice]!
        meta: ListInvoicesMetaData
    }

    extend type Query {
        invoice(id:ID): Invoice
        invoices(options: InvoicesQueryOptions): InvoicesResult
    }
   
    extend type Mutation {
        createInvoice(formData:InvoiceInput!):String
        updateInvoice(id:ID!, formData:InvoiceInput!):Invoice
        deleteInvoice(id:ID!):String
    }
`;

export default typeDefs;
