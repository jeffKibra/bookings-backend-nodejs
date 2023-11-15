import { ClientSession, ObjectId } from 'mongodb';
//
import { ContactModel, JournalEntryModel } from '../../../../models';
//
import { paymentTerms } from '../../../../../constants';

import {
  IAccount,
  IContactForm,
  IContact,
  IContactSummary,
  IContactFromDb,
} from '../../../../../types';

// ----------------------------------------------------------------

export default class Customer {
  protected session: ClientSession | null;

  orgId: string;
  userId: string;
  customerId: string;

  constructor(
    session: ClientSession | null,
    orgId: string,
    userId: string,
    customerId: string
  ) {
    this.session = session;

    this.orgId = orgId;
    this.userId = userId;
    this.customerId = customerId;
  }

  async fetchCurrentCustomer() {
    const { customerId } = this;

    const customer = await Customer.fetch(customerId);
    if (!customer) {
      throw new Error(`Customer with id: ${customerId} not found!`);
    }

    return customer;
  }

  create(customerData: IContactForm, openingBalanceInvoiceId: string) {
    const { orgId, userId, customerId, session } = this;

    const { openingBalance, ...formData } = customerData;
    /**
     * create customer
     */

    const contactInstance = new ContactModel({
      ...formData,
      _id: new ObjectId(customerId),
      openingBalance: {
        amount: openingBalance,
        transactionId: openingBalanceInvoiceId,
      },
      metaData: {
        orgId,
        status: 0,
        contactType: 'customer',
        createdBy: userId,
        createdAt: new Date().toISOString(),
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
      },
    });

    return contactInstance.save({ session });
  }

  async update(formData: IContactForm) {
    const { userId, customerId, session } = this;

    /**
     * update customer
     */

    const updatedCustomer = await this._update(formData);

    // const updatedCustomer = await ContactModel.findByIdAndUpdate(
    //   customerId,
    //   {
    //     ...formData,
    //     'metaData.modifiedBy': userId,
    //     'metaData.modifiedAt': new Date().toISOString(),
    //   },
    //   { session }
    // );

    return updatedCustomer;
  }

  async updateOpeningBalance(amount: number, invoiceId: string) {
    /**
     * updating opening balance
     */

    const updatedCustomer = await this._update({
      openingBalance: { amount, transactionId: amount > 0 ? invoiceId : '' },
    });

    return updatedCustomer;
  }

  async _update(data: IContactForm | Partial<IContactFromDb>) {
    const { userId, customerId, session } = this;

    /**
     * update customer
     */

    const result = await ContactModel.findByIdAndUpdate(
      customerId,
      {
        ...data,
        'metaData.modifiedBy': userId,
        'metaData.modifiedAt': new Date().toISOString(),
      },
      { session, new: true }
    );

    const updatedCustomer = result as unknown as IContact;

    return updatedCustomer;
  }

  delete() {
    const { customerId, session, userId } = this;
    /**
     * mark customer as deleted
     */

    return ContactModel.findByIdAndUpdate(
      customerId,
      {
        'metaData.status': -1,
        'metaData.modifiedBy': userId,
        'metaData.modifiedAt': new Date().toISOString(),
      },
      { session }
    );
  }

  //----------------------------------------------------------------
  //static
  //----------------------------------------------------------------
  static async validateDelete(orgId: string, customerId: string) {
    const entries = await JournalEntryModel.findOne({
      'contacts._id': customerId,
      'metaData.orgId': orgId,
      'metaData.status': 0,
    }).exec();

    if (Array.isArray(entries) && entries.length > 0) {
      throw new Error(
        'This customer has transactions associated with them and thus cannot be deleted! Try making them inactive!'
      );
    }
  }

  //------------------------------------------------------------
  static createCustomerSummary(
    customerId: string,
    customer: IContact | IContactForm | IContactFromDb | IContactSummary
  ): IContactSummary {
    const { displayName } = customer;

    return {
      displayName,
      _id: customerId,
    };
  }

  //----------------------------------------------------------------
  static async fetch(customerId: string) {
    const result = await ContactModel.findById(customerId).exec();
    if (!result) {
      return null;
    }

    const customer = result as unknown as IContact;

    return customer;
  }

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------
}
