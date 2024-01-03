import { ClientSession } from 'mongodb';
import BigNumber from 'bignumber.js';

//
import { InvoiceModel } from '../../../../models';
//
import { PaymentReceived } from '../../paymentsReceived/utils';
import { JournalEntry } from '../../../journal';
import { InvoiceSale } from '../../invoices/utils';
import { getPaymentTermByValue } from '../../../paymentTerms';
import { Accounts } from '../../../accounts';
import { SaleJournal } from '../../utils';

import {
  IAccount,
  IInvoiceForm,
  IContactSummary,
  IInvoice,
  IPaymentTermSummary,
  IAccountSummary,
} from '../../../../../types';
import getResult from '../../bookings/search/getResult';

interface OpeningBalanceData {
  orgId: string;
  userId: string;
  invoiceId: string;
  customerId: string;
}

//------------------------------------------------------------------------------

const { OBA: OBAAccountId, sales: salesAccountId } = Accounts.commonIds;
//------------------------------------------------------------------------------

export default class OpeningBalance extends InvoiceSale {
  // OBAAccount: Account;
  // salesAccount: Account;
  customerId: string;
  //
  accountsInstance: Accounts;

  constructor(session: ClientSession | null, data: OpeningBalanceData) {
    const { orgId, userId, invoiceId, customerId } = data;

    super(session, {
      invoiceId,
      orgId,
      userId,
      transactionType: 'customer_opening_balance',
      saleType: 'normal',
    });

    this.customerId = customerId;

    this.accountsInstance = new Accounts(session, orgId);
  }

  async generateInvoice(openingBalance: number, customer: IContactSummary) {
    // const salesAccount = await this.getAccountData('sales');
    const { orgId } = this;

    return OpeningBalance.generateInvoiceEquivalent(
      orgId,
      openingBalance,
      customer
    );
  }

  async create(openingBalance: number, customerSummary: IContactSummary) {
    const obInvoice = await this.generateInvoice(
      openingBalance,
      customerSummary
    );

    this._create(obInvoice);
  }

  async _create(obInvoice: IInvoiceForm) {
    return Promise.all([
      this.createInvoice(obInvoice),
      this.updateOBEntries(obInvoice),
    ]);
  }

  async updateOBEntries(
    incomingOBInvoice: IInvoiceForm | null,
    currentOBInvoice?: IInvoice
  ) {
    const {
      orgId,
      session,
      userId,
      invoiceId,
      saleType,
      transactionId,
      transactionType,
      accountsInstance,
    } = this;

    const [salesAccount, OBAAccount] = await Promise.all([
      accountsInstance.getAccountData(salesAccountId),
      accountsInstance.getAccountData(OBAAccountId),
    ]);

    const saleJournalInstance = new SaleJournal(session, {
      orgId,
      saleType,
      transactionId,
      transactionType,
      userId,
    });

    if (currentOBInvoice) {
      this.appendCurrentOB(
        saleJournalInstance,
        currentOBInvoice,
        salesAccount,
        OBAAccount
      );
    }

    if (incomingOBInvoice) {
      this.appendIncomingOB(
        saleJournalInstance,
        incomingOBInvoice,
        salesAccount,
        OBAAccount
      );
    }

    const result = await saleJournalInstance.updateEntries();

    return result;
  }

  appendCurrentOB(
    saleJournalInstance: SaleJournal,
    currentInvoice: IInvoice,
    salesAccount: IAccountSummary,
    OBAAccount: IAccountSummary
  ) {
    const { customer, total } = currentInvoice;

    const contact = InvoiceSale.createContactFromCustomer(customer);
    /**
     * 1. debit sales
     */
    saleJournalInstance.appendCurrentEntry({
      account: salesAccount,
      amount: total,
      entryId: '',
      entryType: 'debit',
      transactionType: 'opening_balance',
      contact,
    });
    /**
     * 2. credit opening_balance_adjustments entry for customer opening balance
     */
    saleJournalInstance.appendCurrentEntry({
      account: OBAAccount,
      amount: total,
      entryId: '',
      entryType: 'credit',
      transactionType: 'opening_balance',
      contact,
    });
  }

  appendIncomingOB(
    saleJournalInstance: SaleJournal,
    incomingInvoice: IInvoiceForm,
    salesAccount: IAccountSummary,
    OBAAccount: IAccountSummary
  ) {
    const { customer, total } = incomingInvoice;

    const contact = InvoiceSale.createContactFromCustomer(customer);
    /**
     * 1. debit sales
     */
    saleJournalInstance.appendIncomingEntry({
      account: salesAccount,
      amount: total,
      entryId: '',
      entryType: 'debit',
      transactionType: 'opening_balance',
      contact,
    });
    /**
     * 2. credit opening_balance_adjustments entry for customer opening balance
     */
    saleJournalInstance.appendIncomingEntry({
      account: OBAAccount,
      amount: total,
      entryId: '',
      entryType: 'credit',
      transactionType: 'opening_balance',
      contact,
    });
  }

  async update(incomingOBInvoice: IInvoiceForm) {
    const { orgId, session, customerId } = this;

    const currentOBInvoice = await OpeningBalance.getCustomerOBInvoice(
      orgId,
      customerId,
      session
    );

    if (!currentOBInvoice) {
      throw new Error('Invoice to update not found!');
    }

    const { total: incomingTotal } = incomingOBInvoice;
    const { total: currentTotal } = currentOBInvoice;
    /**
     * update invoice
     */

    await Promise.all([
      this.updateInvoice(incomingOBInvoice, currentOBInvoice),
      this.updateOBEntries(incomingOBInvoice, currentOBInvoice),
    ]);

    // const adjustment = new BigNumber(incomingTotal - currentTotal)
    //   .dp(2)
    //   .toNumber();
    // console.log({ adjustment });
  }

  async delete(currentOBInvoice: IInvoice) {
    /**
     * delete invoice
     */
    return Promise.all([
      this.deleteInvoice(currentOBInvoice),
      this.updateOBEntries(null, currentOBInvoice),
    ]);

    // const { total } = currentOBInvoice;

    // const adjustment = new BigNumber(0 - total).dp(2).toNumber();
  }

  //------------------------------------------------------------
  //static methods
  //------------------------------------------------------------

  static async generateInvoiceEquivalent(
    orgId: string,
    openingBalance: number,
    customer: IContactSummary
  ) {
    const { displayName } = customer;

    const paymentTerm = await getPaymentTermByValue(orgId, 'on_receipt');

    const invoiceForm: IInvoiceForm = {
      customer,
      saleDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      // orderNumber: "",
      // subject: "",
      customerNotes: '',
      paymentTerm,
      items: [
        {
          itemId: 'customer_opening_balance',
          name: 'customer opening balance',
          description: displayName,
          rate: openingBalance,
          qty: 1,
          salesAccountId: 'sales',
          subTotal: openingBalance,
          tax: 0,
          total: openingBalance,
          details: { taxType: 'inclusive', units: '' },
          // type: 'opening_balance',
        },
      ],

      subTotal: openingBalance,
      discount: 0,
      taxType: 'inclusive',
      taxes: [],
      totalTax: 0,
      total: openingBalance,

      // transactionType: "customer_opening_balance",
    };

    return invoiceForm;
  }
  //----------------------------------------------------------------
  static async getCustomerOBRawInvoice(orgId: string, customerId: string) {
    const result = await InvoiceModel.findOne({
      'metaData.orgId': orgId,
      'metaData.status': 0,
      'customer._id': customerId,
    });

    if (!result) {
      return null;
    }

    const invoiceId = result._id.toString();
    const total = +result.total.toString();
    console.log({ total, invoiceId });

    const invoice = result.toJSON() as unknown as IInvoice;

    return {
      ...invoice,
      _id: invoiceId,
      total,
    };
  }

  static async getCustomerOBInvoice(
    orgId: string,
    customerId: string,
    session?: ClientSession | null
  ) {
    const invoice = await this.getCustomerOBRawInvoice(orgId, customerId);

    if (!invoice) {
      return null;
    }
    const { _id: invoiceId } = invoice;

    const { total: paymentsTotal } = await PaymentReceived.getInvoicePayments(
      orgId,
      invoiceId,
      session || null
    );

    return {
      ...invoice,
      paymentsTotal,
    };
  }
}
