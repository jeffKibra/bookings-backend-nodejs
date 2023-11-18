import { VehicleInputFields, VehicleFields } from '../vehicles';
import { MetaDataSharedFields } from '../templates';
import {
  contactSummaryFields,
  downPaymentSharedFields,
  paymentModeFields,
  paymentTermFields,
  saleItemDetailsFields,
  saleItemDetailsInputFields,
  saleItemFields,
  saleItemInputFields,
} from './templates';

//
import bookingsTypeDefs from './bookings';
import invoicesTypeDefs from './invoices';
//

const common = `

    input PaymentTermInput {
        ${paymentTermFields}
    }
    type PaymentTerm {
        ${paymentTermFields}
    }

    input ContactSummaryInput {
        ${contactSummaryFields}
    }
    type ContactSummary {
        ${contactSummaryFields}
    }

    input PaymentModeInput {
        ${paymentModeFields}
    }
    type PaymentMode {
        ${paymentModeFields}
    }

    input DownPaymentInput {
        ${downPaymentSharedFields}
        paymentMode:PaymentModeInput!
    }
    type DownPayment {
        ${downPaymentSharedFields}
        paymentMode:PaymentMode!
    }

    input VehicleForBookingInput {
        _id:ID!
        ${VehicleInputFields}
    }

    type VehicleForBooking {
        _id:ID!
        ${VehicleFields}
    }

    type SaleItemDetails {
        ${saleItemDetailsFields}
    }
    input SaleItemDetailsInput {
        ${saleItemDetailsInputFields}
    }

    type SaleItem {
        ${saleItemFields}
    }
    input SaleItemInput {
        ${saleItemInputFields}
    }

    type SaleMetaData {
        ${MetaDataSharedFields}
        transactionType: String!
        saleType: String!
    }

`;

const salesTypeDefs = [common, bookingsTypeDefs, invoicesTypeDefs];

export default salesTypeDefs;
