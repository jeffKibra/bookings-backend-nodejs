import { VehicleInputFields, VehicleFields } from '../vehicles';
import { MetaDataSharedFields } from '../templates';
import {
  contactSummaryFields,
  downPaymentSharedFields,
  saleItemDetailsFields,
  saleItemDetailsInputFields,
  saleItemFields,
  saleItemInputFields,
} from './templates';

//
import bookingsTypeDefs from './bookings';
import invoicesTypeDefs from './invoices';
import paymentsReceivedTypeDefs from './paymentsReceived';
//

const common = `

    input ContactSummaryInput {
        ${contactSummaryFields}
    }
    type ContactSummary {
        ${contactSummaryFields}
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

const salesTypeDefs = [
  common,
  bookingsTypeDefs,
  invoicesTypeDefs,
  paymentsReceivedTypeDefs,
];

export default salesTypeDefs;
