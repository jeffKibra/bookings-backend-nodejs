import { ClientSession } from 'mongodb';
//
import { TxJournalEntries } from '../../../journal';
import InvoicesPayments from './paymentAllocations';
import { Accounts } from '../../../accounts';

//
import {
  IPaymentAllocation,
  IPaymentAllocationMapping,
  IPaymentAllocationMappingResult,
  IJournalEntryFormData,
  IPaymentReceived,
  IAccountSummary,
  IContactSummary,
} from '../../../../../types';

interface IPayload {
  orgId: string;
  userId: string;
  transactionId: string;
  accountsInstance: Accounts;
}

const {
  commonIds: { AR: ARAccountId, UR: URAccountId, UF: UFAccountId },
} = Accounts;

export default class PaymentReceivedJournal extends TxJournalEntries {
  accountsInstance: Accounts;

  constructor(session: ClientSession | null, payload: IPayload) {
    const { orgId, transactionId, userId, accountsInstance } = payload;

    super(session, {
      orgId,
      transactionId,
      userId,
    });

    this.accountsInstance = accountsInstance;
  }

  async appendCurrentPayment(currentPayment: IPaymentReceived) {
    if (!currentPayment) {
      throw new Error(
        'Invalid value current payment when appending current payment allocation'
      );
    }

    const { accountsInstance } = this;

    const { customer, allocations, excess } = currentPayment;

    const [ARAccount, UFAccount, URAccount] = await Promise.all([
      accountsInstance.getAccountData(ARAccountId),
      accountsInstance.getAccountData(UFAccountId),
      accountsInstance.getAccountData(URAccountId),
    ]);

    //append entries for allocations
    allocations.forEach(allocation => {
      const { amount, invoiceId: entryId, transactionType } = allocation;

      const isInvoicePayment =
        InvoicesPayments.checkIfIsInvoicePayment(transactionType);

      const accountToCredit = isInvoicePayment ? ARAccount : URAccount;
      /**
       * append 2 entries
       * 1. credited account-AR or UR
       * 2. debited account
       */

      this.appendEntriesForCurrentAllocation({
        accountToCredit,
        accountToDebit: UFAccount,
        amount,
        customer,
        entryId,
        transactionType,
      });
    });

    //append entries for excess if >0
    if (excess > 0) {
      this.appendEntriesForCurrentAllocation({
        accountToCredit: URAccount,
        accountToDebit: UFAccount,
        amount: excess,
        customer,
        entryId: 'excess',
        transactionType: 'customer_payment',
      });
    }
  }

  appendEntriesForCurrentAllocation(payload: {
    accountToCredit: IAccountSummary;
    accountToDebit: IAccountSummary;
    amount: number;
    entryId: string;
    transactionType: IPaymentAllocation['transactionType'];
    customer: IContactSummary;
  }) {
    const {
      accountToCredit,
      accountToDebit,
      amount,
      entryId,
      transactionType,
      customer,
    } = payload;
    /**
     * append 2 entries
     * 1. credited account-AR or UR
     * 2. debited account
     */

    this.appendCurrentEntry({
      entryType: 'credit',
      account: accountToCredit,
      amount,
      entryId,
      transactionType,
      contact: customer,
    });
    this.appendCurrentEntry({
      entryType: 'debit',
      account: accountToDebit,
      amount,
      entryId,
      transactionType,
      contact: customer,
    });
  }

  appendEntriesForIncomingAllocation(payload: {
    accountToCredit: IAccountSummary;
    accountToDebit: IAccountSummary;
    amount: number;
    entryId: string;
    transactionType: IPaymentAllocation['transactionType'];
    customer: IContactSummary;
  }) {
    const {
      accountToCredit,
      accountToDebit,
      amount,
      entryId,
      transactionType,
      customer,
    } = payload;
    /**
     * append 2 entries
     * 1. credited account-AR or UR
     * 2. debited account
     */

    const creditResult = this.appendIncomingEntry({
      entryType: 'credit',
      account: accountToCredit,
      amount,
      entryId,
      transactionType,
      contact: customer,
    });
    const debitResult = this.appendIncomingEntry({
      entryType: 'debit',
      account: accountToDebit,
      amount,
      entryId,
      transactionType,
      contact: customer,
    });

    return { debitResult, creditResult };
  }

  async appendIncomingAllocation(
    customer: IContactSummary,
    allocation: IPaymentAllocation
  ) {
    const { amount, transactionType, invoiceId: entryId } = allocation;

    const { accountsInstance } = this;

    const [ARAccount, UFAccount, URAccount] = await Promise.all([
      accountsInstance.getAccountData(ARAccountId),
      accountsInstance.getAccountData(UFAccountId),
      accountsInstance.getAccountData(URAccountId),
    ]);

    const isInvoicePayment =
      InvoicesPayments.checkIfIsInvoicePayment(transactionType);

    const accountToCredit = isInvoicePayment ? ARAccount : URAccount;
    /**
     * append 2 entries
     * 1. credited account-AR or UR
     * 2. debited account
     */

    return this.appendEntriesForIncomingAllocation({
      accountToCredit,
      accountToDebit: UFAccount,
      amount,
      customer,
      entryId,
      transactionType,
    });
  }

  appendIncomingExcess(customer: IContactSummary, amount: number) {
    const allocation = PaymentReceivedJournal.generateExcessAllocation(amount);

    return this.appendIncomingAllocation(customer, allocation);
  }

  //--------------------------------------------------------------------
  //STATIC METHODS
  //--------------------------------------------------------------------

  static generateExcessAllocation(excessAmount: number) {
    const excessAllocation: IPaymentAllocation = {
      amount: excessAmount,
      invoiceId: 'excess',
      transactionType: 'customer_payment',
    };

    return excessAllocation;
  }
}
