import { MetaDataSharedFields } from './templates';

//
const CustomerSummaryFields = `
    _id: ID!
    displayName:String!
`;
const PaymentModeFields = `
    name:String!
    value:String!
`;
const DownPaymentSharedFields = `
    amount:Int!
    reference:String
`;
const BookingSharedFields = `
    startDate:String!
    endDate:String!
    selectedDates:[String!]!
    bookingRate:Int!
    bookingTotal:Int!
    transferAmount:Int!
    subTotal:Int!
    total:Int!
    customerNotes:String
`;

const typeDefs = `#graphql

    input CustomerSummaryInput {
        ${CustomerSummaryFields}
    }
    type CustomerSummary {
        ${CustomerSummaryFields}
    }

    input PaymentModeInput {
        ${PaymentModeFields}
    }
    type PaymentMode {
        ${PaymentModeFields}
    }

    input DownPaymentInput {
        ${DownPaymentSharedFields}
        paymentMode:PaymentModeInput!
    }
    type DownPayment {
        ${DownPaymentSharedFields}
        paymentMode:PaymentMode!
    }

    type BookingPayments {
        count:Int!
        paymentsIds:[String]!
        amounts:[Int]
    }

    type BookingMetaData {
        ${MetaDataSharedFields}
        transactionType:String
    }

    input BookingInput {
        customer:CustomerSummaryInput!
        vehicle:VehicleInput!
        ${BookingSharedFields}
        downPayment:DownPaymentInput!
    }

    type Booking {
        customer:CustomerSummary!
        vehicle:Vehicle!
        ${BookingSharedFields}
        downPayment:DownPayment!
        payments:BookingPayments!
        metaData: BookingMetaData!
        _id:ID!
    }
   
    extend type Query {
        bookings: [Booking]
        booking(id:ID): Booking
    }
   
    extend type Mutation {
        createBooking(formData:BookingInput!):String
        updateBooking(id:ID!, formData:BookingInput!):Booking
        deleteBooking(id:ID!):String
    }
`;

export default typeDefs;