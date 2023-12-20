import { MetaDataSharedFields, SearchMetaCommonFields } from '../templates';

//
import { VehicleInputFields } from '../vehicles';

//
const BookingSharedFields = `
    startDate:String!
    endDate:String!
    selectedDates:[String!]!
    bookingRate:Int!
    bookingTotal:Int!
    transferFee:Int!
    subTotal:Int!
    total:Int!
    customerNotes:String
`;

const BookingInputFields = `
    customer:ContactSummaryInput!
    vehicle: BookingVehicleInput
    ${BookingSharedFields}
`;

const typeDefs = `#graphql

    

    type BookingPayments {
        count:Int!
        paymentsIds:[String]!
        amounts:[Int]
    }

    type BookingMetaData {
        ${MetaDataSharedFields}
        transactionType:String
    }

    input BookingVehicleInput {
        _id:ID!
        ${VehicleInputFields}
    
    }

    input BookingInput {
        ${BookingInputFields}
    }

    input BookingAndDownPaymentInput {
        ${BookingInputFields}
        downPayment:DownPaymentInput!
    }

    type Booking {
        customer:ContactSummary!
        vehicle:Vehicle!
        ${BookingSharedFields}
        balance:Int!
        downPayment:DownPayment!
        payments:BookingPayments!
        metaData: BookingMetaData!
        _id:ID!
        id:String
        searchScore:Float
    }

    type SearchBookingMetaData {
        ${SearchMetaCommonFields}
        facets:VehicleFacets
    }

    input BookingsQueryOptions {
        customerId:String
        sortBy:[String!]
        pagination:Pagination
        filters:VehicleFilters
    }

    type BookingsSearchResult {
        bookings: [Booking]!
        meta:SearchBookingMetaData
    }

    extend type Query {
        bookings: [Booking]
        booking(id:ID): Booking
        searchBookings(query:ID, queryOptions:BookingsQueryOptions):BookingsSearchResult
        findBookingWithAtleastOneOfTheSelectedDates(vehicleId:String!, dates:[String!]!): Booking
    }
   
    extend type Mutation {
        createBooking(formData:BookingAndDownPaymentInput!):String
        updateBooking(id:ID!, formData:BookingInput!):Invoice
        deleteBooking(id:ID!):String
    }
`;

export default typeDefs;
