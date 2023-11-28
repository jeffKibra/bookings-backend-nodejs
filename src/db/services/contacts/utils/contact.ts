import { ClientSession, ObjectId } from 'mongodb';
//
import { CustomerOpeningBalance } from '../../sales/customerOB/utils';
//
import { ContactModel, JournalEntryModel } from '../../../models';
//
import { paymentTerms } from '../../../../constants';

import {
  IAccount,
  IContactForm,
  IContact,
  IContactSummary,
  IContactFromDb,
  IContactGroup,
} from '../../../../types';

// ----------------------------------------------------------------

export default class Contact {
  protected session: ClientSession | null;

  // group: IContactGroup;
  orgId: string;
  userId: string;
  contactId: string;

  constructor(
    session: ClientSession | null,
    orgId: string,
    userId: string,
    contactId: string
    // group: IContactGroup
  ) {
    this.session = session;

    this.orgId = orgId;
    this.userId = userId;
    this.contactId = contactId;
    // this.group = group;
  }

  async fetchCurrentContact() {
    const { contactId } = this;

    const customer = await Contact.getById(contactId);
    if (!customer) {
      throw new Error(`Contact with id: ${contactId} not found!`);
    }

    return customer;
  }

  async create(formData: IContactForm, group: IContactGroup) {
    await Promise.all([
      this._create(formData, group),
      this.createOB(formData, group),
    ]);
  }

  _create(formData: IContactForm, group: IContactGroup) {
    const { orgId, userId, contactId, session } = this;

    /**
     * create customer
     */

    const contactInstance = new ContactModel({
      ...formData,
      _id: new ObjectId(contactId),
      // openingBalance: {
      //   amount: openingBalance,
      //   transactionId: openingBalanceInvoiceId,
      // },
      metaData: {
        orgId,
        status: 0,
        group,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        modifiedBy: userId,
        modifiedAt: new Date().toISOString(),
      },
    });

    return contactInstance.save({ session });
  }

  async update(formData: IContactForm) {
    /**
     * update customer
     */

    const updatedContact = await this._update(formData);

    // const updatedContact = await ContactModel.findByIdAndUpdate(
    //   contactId,
    //   {
    //     ...formData,
    //     'metaData.modifiedBy': userId,
    //     'metaData.modifiedAt': new Date().toISOString(),
    //   },
    //   { session }
    // );

    return updatedContact;
  }

  async createOB(formData: IContactForm, group: IContactGroup) {
    if (group === 'customer') {
      await this.createCustomerOB(formData);
    }
  }

  async createCustomerOB(formData: IContactForm) {
    const { session, orgId, contactId, userId } = this;
    let invoiceId = '';

    const { openingBalance } = formData;

    if (openingBalance > 0) {
      invoiceId = new ObjectId().toString();

      const ob = new CustomerOpeningBalance(session, {
        orgId,
        userId,
        invoiceId,
        customerId: contactId,
      });

      const customerDataSummary = Contact.createContactSummary(
        contactId,
        formData
      );

      //create opening balance
      await ob.create(openingBalance, customerDataSummary);
    }

    return invoiceId;
  }

  async updateOpeningBalance(amount: number, invoiceId: string) {
    /**
     * updating opening balance
     */

    const updatedContact = await this._update({
      // openingBalance: { amount, transactionId: amount > 0 ? invoiceId : '' },
      openingBalance: amount,
    });

    return updatedContact;
  }

  async _update(data: Partial<IContactForm>) {
    const { userId, contactId, session } = this;

    /**
     * update customer
     */

    const result = await ContactModel.findByIdAndUpdate(
      contactId,
      {
        ...data,
        'metaData.modifiedBy': userId,
        'metaData.modifiedAt': new Date(),
      },
      { session, new: true }
    );

    const updatedContact = result as unknown as IContact;

    return updatedContact;
  }

  delete() {
    const { contactId, session, userId } = this;
    /**
     * mark customer as deleted
     */

    return ContactModel.findByIdAndUpdate(
      contactId,
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
  static async validateDelete(orgId: string, contactId: string) {
    const entries = await JournalEntryModel.findOne({
      'contact._id': contactId,
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
  static createContactSummary(
    contactId: string,
    customer: IContact | IContactForm | IContactFromDb | IContactSummary
  ): IContactSummary {
    const { displayName } = customer;

    return {
      displayName,
      _id: contactId,
    };
  }

  //----------------------------------------------------------------
  static async getById(contactId: string) {
    const result = await ContactModel.findById(contactId).exec();
    if (!result) {
      return null;
    }

    const customer = result.toJSON() as unknown as IContact;

    return customer;
  }

  //------------------------------------------------------------

  //------------------------------------------------------------

  //------------------------------------------------------------
}
