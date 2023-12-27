import { ClientSession } from 'mongodb';
import BigNumber from 'bignumber.js';

//
import { InvoiceModel } from '../../../../models';
//
import { PaymentReceived } from '../../paymentsReceived/utils';
import { JournalEntry } from '../../../journal';
import { InvoiceSale } from '../../invoices/utils';
import { getPaymentTermByValue } from '../../../paymentTerms';

import {
  IAccount,
  IInvoiceForm,
  IContactSummary,
  IInvoice,
  IPaymentTermSummary,
} from '../../../../../types';

interface OpeningBalanceData {
  orgId: string;
  userId: string;
  invoiceId: string;
  customerId: string;
}

//------------------------------------------------------------------------------

const OBAAccountId = 'opening_balance_adjustments';
//------------------------------------------------------------------------------

export default class OpeningBalance extends InvoiceSale {
  // OBAAccount: Account;
  // salesAccount: Account;
  customerId: string;

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

    // const salesAccount = getAccountData('sales', accounts);
    // const OBAAccount = getAccountData('opening_balance_adjustments', accounts);

    // if (!salesAccount) {
    //   throw new Error('Sales account not found!');
    // }
    // if (!OBAAccount) {
    //   throw new Error('Opening balance adjustments account not found!');
    // }

    // this.salesAccount = salesAccount;
    // this.OBAAccount = OBAAccount;
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
    const creditAccountsMapping = InvoiceSale.generateCreditAccounts(obInvoice);
    const debitAccountsMapping = InvoiceSale.generateDebitAccounts(obInvoice);

    await Promise.all([
      this.createInvoice(
        obInvoice,
        creditAccountsMapping,
        debitAccountsMapping
      ),
      this.createOBEntries(obInvoice),
    ]);
  }

  async createOBEntries(incomingOBInvoice: IInvoiceForm) {
    const { orgId, session, userId, invoiceId } = this;

    const salesAccount = await this.getAccountData('sales');
    const OBAAccount = await this.getAccountData(OBAAccountId);

    const {
      customer: { _id: customerId },
      total,
    } = incomingOBInvoice;

    const contact = InvoiceSale.createContactFromCustomer(
      incomingOBInvoice.customer
    );

    /**
     * 1. debit sales
     */
    const journal = new JournalEntry(session, userId, orgId);
    journal.debitAccount({
      account: salesAccount,
      amount: total,
      transactionId: { primary: invoiceId },
      transactionType: 'opening_balance',
      contact,
    });

    /**
     * 2. credit opening_balance_adjustments entry for customer opening balance
     */
    journal.creditAccount({
      account: OBAAccount,
      amount: total,
      transactionId: { primary: invoiceId },
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
    const creditAccountsMapping = InvoiceSale.generateCreditAccounts(
      incomingOBInvoice,
      currentOBInvoice
    );

    const debitAccountsMapping = InvoiceSale.generateDebitAccounts(
      incomingOBInvoice,
      currentOBInvoice
    );

    await Promise.all([
      this.updateInvoice(
        incomingOBInvoice,
        currentOBInvoice,
        creditAccountsMapping,
        debitAccountsMapping,
        currentTotal
      ),
      this.createOBEntries(incomingOBInvoice),
    ]);

    // const adjustment = new BigNumber(incomingTotal - currentTotal)
    //   .dp(2)
    //   .toNumber();
    // console.log({ adjustment });
  }

  async delete(currentOBInvoice: IInvoice) {
    const { orgId } = this;

    const { deletedAccounts: deletedCreditAccounts } =
      InvoiceSale.generateCreditAccounts(null, currentOBInvoice);
    const { deletedAccounts: deletedDebitAccounts } =
      InvoiceSale.generateDebitAccounts(null, currentOBInvoice);

    /**
     * delete invoice
     */
    await Promise.all([
      this.deleteInvoice(
        currentOBInvoice,
        deletedCreditAccounts,
        deletedDebitAccounts
      ),
      this.deleteOBEntries(),
    ]);

    // const { total } = currentOBInvoice;

    // const adjustment = new BigNumber(0 - total).dp(2).toNumber();
  }

  async deleteOBEntries() {
    const { session, invoiceId, userId, orgId } = this;

    const journal = new JournalEntry(session, userId, orgId);

    await Promise.all([
      journal.deleteEntry({ primary: invoiceId }, 'sales'),
      journal.deleteEntry({ primary: invoiceId }, OBAAccountId),
    ]);
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
