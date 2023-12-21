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
    paidInvoices: [PaidInvoiceInput]
`;

//     payments: [PaidInvoice]
// account: SelectedAccount!;

const paymentReceivedFields = `
    ${paymentReceivedSharedFields}
    customer:ContactSummary!
    paymentMode: PaymentMode!
    paidInvoices: [PaidInvoice]

    _id:ID!
    excess:Int
    metaData:SaleMetaData!
`;

const paidInvoicesFields = `
    invoiceId: String!
    amount: Int!
`;

const typeDefs = `#graphql

    input PaidInvoiceInput {
        ${paidInvoicesFields}
    }
    type PaidInvoice {
        ${paidInvoicesFields}
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

    input PaymentsReceivedQueryOptions {
        customerId:String
        sortBy:[String!]
        pagination:Pagination
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
