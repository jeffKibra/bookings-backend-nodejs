import { ClientSession } from 'mongodb';

// import BigNumber from "bignumber.js";

//Sale class
import { SaleDataAndAccount } from '../../utils/sale';

import InvoiceSale, { InvoiceDetails } from './invoiceSale';

import {
  IAccount,
  IAccountSummary,
  IInvoiceForm,
  IInvoice as InvoiceData,
} from '../../../../../types';

//----------------------------------------------------------------

//----------------------------------------------------------------

export default class Invoice extends InvoiceSale {
  // incomingInvoice: IInvoiceForm | null;
  // currentInvoice: Invoice | null;

  errors: {
    [key: string]: string;
  } = { incoming: 'Please provide incoming invoice data' };

  constructor(
    session: ClientSession,
    invoiceDetails: Omit<InvoiceDetails, 'transactionType'>
  ) {
    // console.log({ invoiceDetails });
    const { invoiceId, orgId, userId, saleType } = invoiceDetails;

    super(session, {
      orgId,
      invoiceId,
      transactionType: 'invoice',
      userId,
      saleType,
    });
  }

  async create(incomingInvoice: IInvoiceForm) {
    await this.getARAccount();

    const { creditAccountsMapping, debitAccountsMapping } =
      this.initCreateSale(incomingInvoice);

    //create invoice
    await this.createInvoice(
      incomingInvoice,
      creditAccountsMapping,
      debitAccountsMapping
    );
  }

  async update(incomingInvoice: IInvoiceForm) {
    const ARAccount = await this.getARAccount();
    const { invoiceId } = this;

    const { currentInvoice } = await InvoiceSale.validateUpdate(
      invoiceId,
      incomingInvoice
    );
    /**
     * initialize sale update-happens after fetching current invoice
     */
    const incomingInvoiceAndAccount: SaleDataAndAccount = {
      saleDetails: incomingInvoice,
      debitAccount: ARAccount,
    };
    const currentInvoiceAndAccount: SaleDataAndAccount = {
      saleDetails: currentInvoice,
      debitAccount: ARAccount,
    };

    const { creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMapping(incomingInvoice, currentInvoice);

    // console.log({ accountsSummary, accountsMapping });

    const { total: currentTotal } = currentInvoice;

    //update invoice
    const updatedInvoice = await this.updateInvoice(
      incomingInvoice,
      currentInvoice,
      creditAccountsMapping,
      debitAccountsMapping,
      currentTotal
    );

    // const adjustment = new BigNumber(incomingTotal - currentTotal)
    //   .dp(2)
    //   .toNumber();

    return updatedInvoice;
  }

  async delete() {
    const currentInvoice = await this.getCurrentInvoice();

    InvoiceSale.validateDelete(currentInvoice);

    const { creditAccountsMapping, debitAccountsMapping } =
      this.generateAccountsMapping(null, currentInvoice);

    /**
     * delete invoice
     */

    await this.deleteInvoice(
      currentInvoice,
      creditAccountsMapping.deletedAccounts,
      debitAccountsMapping.deletedAccounts
    );
    // console.log({ accountsSummary, accountsMapping });
  }

  //-------------------------------------------------------------

  static generateSystemUpdateData(
    data: Record<string, unknown>,
    systemTask = 'UPDATE_OVERDUE_STATE'
  ) {
    return {
      ...data,
      overdueAt: new Date(),
      modifiedBy: 'system', //mark to avoid infinite loops
      systemTask: systemTask,
      modifiedAt: new Date(),
    };
  }
}
