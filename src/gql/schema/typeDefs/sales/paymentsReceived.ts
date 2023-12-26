import { MetaDataSharedFields, ListMetaCommonFields } from '../templates';

//

const paymentReceivedSharedFields = `
    amount:Int!
    paymentDate:String!
    reference:String
`;

// account: SelectedAccountInput!; include if you give users option to select deposit account
const paymentReceivedInputFields = `
    ${paymentReceivedSharedFields}
    customer:ContactSummaryInput!
    paymentMode: PaymentModeInput!
    allocations: [InvoicePaymentAllocationInput]
`;

//     payments: [PaidInvoice]
// account: SelectedAccount!;

const paymentReceivedFields = `
    ${paymentReceivedSharedFields}
    customer:ContactSummary!
    paymentMode: PaymentMode!
    allocations: [PaidInvoice]

    _id:ID!
    excess:Int
    metaData:SaleMetaData!
`;

const allocationsFields = `
    invoiceId: String!
    amount: Int!
`;

const typeDefs = `#graphql

    input InvoicePaymentAllocationInput {
        ${allocationsFields}
    }
    type PaidInvoice {
        ${allocationsFields}
    }

    input PaymentReceivedInput {
        ${paymentReceivedInputFields}
    }

    type PaymentReceived {
        ${paymentReceivedFields}
    }

    type ListPaymentsReceivedMetaData {
        ${ListMetaCommonFields}
    }

    input PaymentReceivedFilters {
        invoiceId: String
    }

    input PaymentsReceivedQueryOptions {
        customerId:String
        sortBy:[String!]
        pagination:Pagination
        filters: PaymentReceivedFilters
    }

    type PaymentsReceivedResult {
        list: [PaymentReceived]!
        meta: ListPaymentsReceivedMetaData
    }

    extend type Query {
        paymentReceived(id:ID): PaymentReceived
        paymentsReceived(options: PaymentsReceivedQueryOptions): PaymentsReceivedResult
    }
   
    extend type Mutation {
        createPaymentReceived(formData:PaymentReceivedInput!):String
        updatePaymentReceived(id:ID!, formData:PaymentReceivedInput!):PaymentReceived
        deletePaymentReceived(id:ID!):String
    }
`;

export default typeDefs;
