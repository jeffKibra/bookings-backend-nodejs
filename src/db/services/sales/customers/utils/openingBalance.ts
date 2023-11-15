import { ClientSession } from 'mongodb';
import BigNumber from 'bignumber.js';

import { JournalEntry } from '../../../journal';
import { InvoiceSale } from '../../invoices/utils';

import {
  IAccount,
  IInvoiceForm,
  IContactSummary,
  IInvoice,
} from '../../../../../types';

interface OpeningBalanceData {
  orgId: string;
  userId: string;
  invoiceId: string;
}

//------------------------------------------------------------------------------

const OBAAccountId = 'opening_balance_adjustments';
//------------------------------------------------------------------------------

export default class OpeningBalance extends InvoiceSale {
  // OBAAccount: Account;
  // salesAccount: Account;

  constructor(session: ClientSession, data: OpeningBalanceData) {
    const { orgId, userId, invoiceId } = data;

    super(session, {
      invoiceId,
      orgId,
      userId,
      transactionType: 'customer_opening_balance',
      saleType: 'normal',
    });

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

    return OpeningBalance.generateInvoiceEquivalent(openingBalance, customer);
  }

  async create(obInvoice: IInvoiceForm) {
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
    const { orgId, session, userId } = this;

    const salesAccount = await this.getAccountData('sales');
    const OBAAccount = await this.getAccountData(OBAAccountId);

    const {
      customer: { _id: customerId },
      total,
    } = incomingOBInvoice;

    const contacts = InvoiceSale.createContactsFromCustomer(
      incomingOBInvoice.customer
    );

    /**
     * 1. debit sales
     */
    const journal = new JournalEntry(session, userId, orgId);
    journal.debitAccount({
      account: salesAccount,
      amount: total,
      transactionId: customerId,
      transactionType: 'opening_balance',
      contacts,
    });

    /**
     * 2. credit opening_balance_adjustments entry for customer opening balance
     */
    journal.creditAccount({
      account: OBAAccount,
      amount: total,
      transactionId: customerId,
      transactionType: 'opening_balance',
      contacts,
    });
  }

  async update(incomingOBInvoice: IInvoiceForm) {
    const { invoiceId } = this;

    const { currentInvoice: currentOBInvoice } =
      await InvoiceSale.validateUpdate(invoiceId, incomingOBInvoice);

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
    InvoiceSale.validateDelete(currentOBInvoice);

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
      journal.deleteEntry(invoiceId, 'sales'),
      journal.deleteEntry(invoiceId, OBAAccountId),
    ]);
  }

  //------------------------------------------------------------
  //static methods
  //------------------------------------------------------------
  static generateInvoiceEquivalent(
    openingBalance: number,
    customer: IContactSummary
  ) {
    const { displayName } = customer;

    const invoiceForm: IInvoiceForm = {
      customer,
      saleDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      // orderNumber: "",
      // subject: "",
      customerNotes: '',
      paymentTerm: { days: 0, name: 'Due on Receipt', value: 'on_receipt' },
      items: [
        {
          // itemId: 'customer_opening_balance',
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
}
