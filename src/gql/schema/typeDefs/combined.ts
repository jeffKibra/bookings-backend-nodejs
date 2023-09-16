const typeDefs = `#graphql
    type MetaData {
        orgId: String!
        createdBy: String!
        createdAt: Int!
        modifiedBy: String!
        modifiedAt: Int!
        status:Int!
    }
    type Vehicle {
        registration: String! 
        rate: Int!
        make: String! 
        model: String! 
        year: Int!
        type: String! 
        color: String! 
        description: String 
        _id: ID! 
        metaData: MetaData! 
    }

    

    input VehicleInput {
        registration: String! 
        rate: Int!
        make: String! 
        model: String! 
        year: Int!
        type: String! 
        color: String! 
        description: String 
    }

    

    type CustomerSummary {
        _id: ID!
        displayName:String!
    }

    type PaymentMode {
        name:String!
        value:String!
    }

    type DownPayment {
        amount:Int!
        paymentMode:PaymentMode!
        reference:String
    }

    type BookingPayments {
        count:Int!
        paymentsIds:[String]!
        amounts:[Int]
    }

    type BookingMetaData {
        orgId: String!
        createdBy: String!
        createdAt: Int!
        modifiedBy: String!
        modifiedAt: Int!
        status:Int!
        transactionType:String
    }

    type BookingInput {
        customer:CustomerSummary!
        vehicle:Vehicle!
        startDate:String!
        endDate:String!
        selectedDates:[String!]!
        bookingRate:Int!
        bookingTotal:Int!
        transferAmount:Int!
        subTotal:Int!
        total:Int!
        customerNotes:String
        downPayment:DownPayment!
    }

    type Booking {
        customer:CustomerSummary!
        vehicle:Vehicle!
        startDate:String!
        endDate:String!
        selectedDates:[String!]!
        bookingRate:Int!
        bookingTotal:Int!
        transferAmount:Int!
        subTotal:Int!
        total:Int!
        customerNotes:String
        downPayment:DownPayment!
        payments:BookingPayments!
        metaData: BookingMetaData!
        _id:ID!
    }
   
    type Query {
        vehicles: [Vehicle]
        vehicle(id:ID): Vehicle
        bookings: [Booking]
        booking(id:ID): Booking
    }
   
    type Mutation {
        createVehicle(formData:VehicleInput!):String
        updateVehicle(id:ID!, formData:VehicleInput!):Vehicle
        deleteVehicle(id:ID!):String
        createBooking(formData:BookingInput!):String
        updateBooking(id:ID!, formData:BookingInput!):Booking
        deleteBooking(id:ID!):String
    }
`;

export default typeDefs;
