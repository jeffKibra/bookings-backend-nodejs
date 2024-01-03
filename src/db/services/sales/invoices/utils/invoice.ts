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
    session: ClientSession | null,
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
    return this.createInvoice(incomingInvoice);
  }

  async update(incomingInvoice: IInvoiceForm) {
    const currentInvoice = await this.getCurrentInvoice();

    InvoiceSale.validateUpdate(currentInvoice, incomingInvoice);
    /**
     * initialize sale update-happens after fetching current invoice
     */

    //update invoice
    const updatedInvoice = await this.updateInvoice(
      incomingInvoice,
      currentInvoice
    );

    // const adjustment = new BigNumber(incomingTotal - currentTotal)
    //   .dp(2)
    //   .toNumber();

    return updatedInvoice;
  }

  async delete() {
    const currentInvoice = await this.getCurrentInvoice();

    InvoiceSale.validateDelete(currentInvoice);

    /**
     * delete invoice
     */

    const result = await this.deleteInvoice(currentInvoice);

    return result;
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
