import {
  Timestamp,
  FieldValue,
  getFirestore,
  DocumentSnapshot,
  WriteBatch,
  Transaction,
} from "firebase-admin/firestore";

import { OrgSummary, ContactSummary } from "../../../utils/summaries";
import { dbCollections } from "../../../utils/firebase";
import { paymentTerms } from "../../../constants";

import {
  Account,
  IContactForm,
  IContact,
  IContactSummary,
  IContactFromDb,
} from "../../../types";

// ----------------------------------------------------------------
const { serverTimestamp } = FieldValue;
const db = getFirestore();

export default class Customer {
  batch: WriteBatch | null;
  transaction: Transaction | null;
  firestoreWriteMethods: Transaction | WriteBatch;

  orgId: string;
  userId: string;
  customerId: string;
  accounts: Record<string, Account>;

  static walkInCustomer: IContactSummary = {
    displayName: "Walk-in Customer",
    companyName: "",
    id: "walk_in_customer",
    email: "",
    type: "individual",
    contactType: "customer",
  };

  constructor(
    firestoreWriteMethods: WriteBatch | Transaction,
    orgId: string,
    userId: string,
    accounts: Record<string, Account>,
    customerId: string
  ) {
    this.firestoreWriteMethods = firestoreWriteMethods;

    if (firestoreWriteMethods instanceof Transaction) {
      this.transaction = firestoreWriteMethods;
      this.batch = null;
    } else if (firestoreWriteMethods instanceof WriteBatch) {
      this.batch = firestoreWriteMethods;
      this.transaction = null;
    } else {
      console.log({ firestoreWriteMethods });
      throw new Error("Invalid param firestoreWriteMethods");
    }

    this.orgId = orgId;
    this.userId = userId;
    this.customerId = customerId;
    this.accounts = accounts;
  }

  fetchCurrentCustomer() {
    const { orgId, customerId } = this;

    return Customer.fetch(orgId, customerId);
  }

  create(customerData: IContactForm, openingBalanceInvoiceId: string) {
    const {
      orgId,
      userId,
      customerId,
      batch,
      transaction,
      firestoreWriteMethods,
      accounts,
    } = this;

    const { openingBalance, ...formData } = customerData;
    const customerFromDb: IContactFromDb = {
      ...formData,
      openingBalance: {
        amount: openingBalance,
        transactionId: openingBalanceInvoiceId,
      },
      orgId,
      status: 0,
      contactType: "customer",
      createdBy: userId,
      createdAt: serverTimestamp() as Timestamp,
      modifiedBy: userId,
      modifiedAt: serverTimestamp() as Timestamp,
    };
    // console.log({ customerFromDb });

    const orgSummary = new OrgSummary(firestoreWriteMethods, orgId, accounts);
    orgSummary.append("customers", 1, 0);
    //update orgSummary
    orgSummary.update();

    /**
     * create customer
     */
    const customersCollection = dbCollections(orgId).contacts;
    const customerRef = customersCollection.doc(customerId);

    if (transaction) {
      transaction.set(customerRef, {
        ...customerFromDb,
      });
    } else if (batch) {
      batch.set(customerRef, {
        ...customerFromDb,
      });
    }
  }

  delete() {
    const {
      orgId,
      customerId,
      batch,
      transaction,
      firestoreWriteMethods,
      userId,
      accounts,
    } = this;
    /**
     * update counters for one deleted customer
     */
    const orgSummary = new OrgSummary(firestoreWriteMethods, orgId, accounts);
    orgSummary.append("customers", 0, 1);
    orgSummary.update();
    /**
     * mark customer as deleted
     */
    const customerRef = db
      .collection("organizations")
      .doc(orgId)
      .collection("customers")
      .doc(customerId);

    if (transaction) {
      transaction.update(customerRef, {
        status: -1,
        modifiedBy: userId,
        modifiedAt: serverTimestamp(),
      });
    } else if (batch) {
      batch.update(customerRef, {
        status: -1,
        modifiedBy: userId,
        modifiedAt: serverTimestamp(),
      });
    }
  }

  //----------------------------------------------------------------
  //static
  //----------------------------------------------------------------
  static async validateDelete(orgId: string, customerId: string) {
    const snap = await db
      .collectionGroup("journal")
      .orderBy("createdAt", "desc")
      .where("orgId", "==", orgId)
      // .where("transactionDetails.customer.customerId", "==", customerId)
      .where("contactsIds", "array-contains", customerId)
      .where("status", "==", 0)
      .limit(1)
      .get();

    const { size } = snap;
    // console.log("validating customer deletion", { size });

    if (size > 0) {
      //deletion not allowed
      throw new Error(
        "This customer has transactions associated with them and thus cannot be deleted! Try making them inactive!"
      );
    }
  }

  //------------------------------------------------------------
  static createDataSummary(
    customerId: string,
    customer: IContact | IContactForm | IContactFromDb | IContactSummary
  ): IContactSummary {
    const { displayName, type, companyName, email, contactType } = customer;

    return {
      displayName,
      type,
      companyName,
      email,
      contactType,
      id: customerId,
    };
  }

  //----------------------------------------------------------------
  static createCustomerRef(orgId: string, customerId: string) {
    return dbCollections(orgId).contacts.doc(customerId);
  }

  //----------------------------------------------------------------
  static async fetch(orgId: string, customerId: string) {
    const customerRef = Customer.createCustomerRef(orgId, customerId);

    const snap = await customerRef.get();

    return Customer.retrieveCustomerData(customerId, snap);
  }

  //------------------------------------------------------------
  static async transactionFetch(
    transaction: Transaction,
    orgId: string,
    customerId: string
  ) {
    const customerRef = Customer.createCustomerRef(orgId, customerId);

    const snap = await transaction.get(customerRef);

    return Customer.retrieveCustomerData(customerId, snap);
  }

  //------------------------------------------------------------
  static retrieveCustomerData(customerId: string, snap: DocumentSnapshot) {
    if (!snap.exists) {
      throw new Error(`Customer data with id ${customerId} does not exist!`);
    }

    const snapData = snap.data() as IContactFromDb;

    const customerData: IContact = {
      ...snapData,
      id: snap.id,
    };

    return customerData;
  }
  //------------------------------------------------------------
  static createWalkInCustomer(
    batch: WriteBatch,
    orgId: string,
    userId: string
  ) {
    const customer = Customer.walkInCustomer;
    const { id: customerId } = customer;

    const customerRef = Customer.createCustomerRef(orgId, customerId);

    const customerData: IContactFromDb = {
      ...customer,
      firstName: "Walk-in",
      lastName: "Customer",
      salutation: "",
      companyName: "",
      billingAddress: {
        city: "",
        country: "",
        postalCode: "",
        state: "",
        street: "",
      },
      shippingAddress: {
        city: "",
        country: "",
        postalCode: "",
        state: "",
        street: "",
      },
      createdAt: serverTimestamp() as Timestamp,
      modifiedAt: serverTimestamp() as Timestamp,
      createdBy: userId,
      modifiedBy: userId,
      openingBalance: { amount: 0, transactionId: "" },
      orgId,
      status: 0,
      contactType: "customer",
      paymentTerm: paymentTerms.on_receipt,
      website: "",
      mobile: "",
      phone: "",
      remarks: "",
    };

    //create summary
    ContactSummary.createWithBatch(batch, orgId, customerId);
    //create customer
    batch.set(customerRef, { ...customerData }, { merge: true });
  }
}
