import { ClientSession } from 'mongodb';
import BigNumber from 'bignumber.js';
//
import { TxJournalEntries } from '../../../journal';
import PaymentAllocations from './paymentAllocations';
import { Accounts } from '../../../accounts';

//
import {
  IPaymentAllocation,
  IPaymentReceived,
  IAccountSummary,
  IContactSummary,
  IUserPaymentReceivedForm,
  PaymentTransactionTypes,
  IJournalEntryType,
} from '../../../../../types';

type ITransactionType = keyof PaymentTransactionTypes;

interface IPayload {
  orgId: string;
  userId: string;
  transactionId: string;
  accountsInstance: Accounts;
}

type IProcessingStage = 'incoming' | 'current';

const {
  commonIds: { AR: ARAccountId, UR: URAccountId, UF: UFAccountId },
} = Accounts;

export default class PaymentReceivedJournal extends TxJournalEntries {
  accountsInstance: Accounts;
  //

  constructor(session: ClientSession | null, payload: IPayload) {
    const { orgId, transactionId, userId, accountsInstance } = payload;

    super(session, {
      orgId,
      transactionId,
      userId,
    });

    this.accountsInstance = accountsInstance;
  }

  async fetchNeededAccounts() {
    const { accountsInstance } = this;

    const [ARAccount, UFAccount, URAccount] = await Promise.all([
      accountsInstance.getAccountData(ARAccountId),
      accountsInstance.getAccountData(UFAccountId),
      accountsInstance.getAccountData(URAccountId),
    ]);

    return {
      ARAccount,
      UFAccount,
      URAccount,
    };
  }

  async appendCurrentPayment(currentPayment: IPaymentReceived) {
    if (!currentPayment) {
      throw new Error(
        'Invalid value current payment when appending current payment allocation'
      );
    }

    const { customer: contact, allocations, excess, amount } = currentPayment;

    const { ARAccount, UFAccount, URAccount } =
      await this.fetchNeededAccounts();

    const stage: IProcessingStage = 'current';

    //append entry for payment total-undeposited_funds account
    this.appendPaymentTotal(amount, contact, UFAccount, stage);

    //append entries for allocations
    allocations.forEach(allocation => {
      const { transactionType } = allocation;

      const isInvoicePayment =
        PaymentAllocations.checkIfIsInvoicePayment(transactionType);

      const accountToCredit = isInvoicePayment ? ARAccount : URAccount;

      this.appendAllocation(allocation, contact, accountToCredit, stage);
    });

    //append entries for excess if >0
    if (excess > 0) {
      this.appendExcess(excess, contact, URAccount, stage);
    }
  }

  async appendIncomingPayment(incomingPayment: IUserPaymentReceivedForm) {
    if (!incomingPayment) {
      throw new Error('Incoming PaymentReceived data required!');
    }

    const { orgId, session } = this;

    let allocationsTotal = new BigNumber(0);
    let allocationsToInvoicesTotal = 0;
    let excess = 0;
    //
    const allocations: IPaymentAllocation[] = [];
    //
    const {
      customer: contact,
      amount: paymentTotal,
      allocations: incomingAllocations,
    } = incomingPayment;

    const { ARAccount, UFAccount, URAccount } =
      await this.fetchNeededAccounts();

    const stage: IProcessingStage = 'incoming';
    /**
     * append undeposited funds  entry for payment total
     */
    this.appendPaymentTotal(paymentTotal, contact, UFAccount, stage);

    //
    await Promise.all(
      incomingAllocations.map(async incomingAllocation => {
        const {
          amount,
          invoiceId,
          transactionType: presetTransactionType,
        } = incomingAllocation;
        // console.log({ invoiceId, amount });

        if (amount > 0) {
          allocationsTotal = allocationsTotal.plus(amount);
          //

          const transactionType: keyof PaymentTransactionTypes =
            presetTransactionType || 'invoice_payment';

          const allocation: IPaymentAllocation = {
            amount,
            invoiceId,
            transactionType,
          };
          //
          allocations.push(allocation);
          //
          const { current: currentAllocatedAmount } = this.appendAllocation(
            allocation,
            contact,
            ARAccount,
            stage
          );
          //

          if (transactionType === 'invoice_payment') {
            /**
             * add check to prevent validation when creating down payment.
             * transactionType for down payment=invoice_down_payment
             */

            await PaymentAllocations.validateInvoicePaymentAllocation(
              orgId,
              allocation,
              currentAllocatedAmount,
              session
            );
            //
          }
        }
      })
    );

    allocationsToInvoicesTotal = allocationsTotal.dp(2).toNumber();

    if (allocationsToInvoicesTotal > paymentTotal) {
      throw new Error(
        'invoices payments cannot be more than customer payment!'
      );
    }

    //

    excess = new BigNumber(paymentTotal)
      .minus(allocationsToInvoicesTotal)
      .dp(2)
      .toNumber();

    if (excess > 0) {
      this.appendExcess(excess, contact, URAccount, stage);
    }

    return {
      allocations,
      allocationsTotal: allocationsToInvoicesTotal,
      excess,
    };
  }

  appendAllocation(
    allocation: IPaymentAllocation,
    contact: IContactSummary,
    accountToCredit: IAccountSummary,
    stage: IProcessingStage
  ) {
    const { amount, invoiceId: entryId, transactionType } = allocation;
    //
    const entryType = 'credit';
    const account = accountToCredit;

    let result: { current: number; incoming: number } = {
      current: amount, //initialized for current entry
      incoming: 0,
    };

    if (stage === 'current') {
      this.appendCurrentEntry({
        entryType,
        account,
        amount,
        entryId,
        transactionType,
        contact,
      });
    } else {
      result = this.appendIncomingEntry({
        entryType,
        account,
        amount,
        entryId,
        transactionType,
        contact,
      });
    }

    return result;
  }

  appendExcess(
    amount: number,
    contact: IContactSummary,
    accountToCredit: IAccountSummary,
    stage: IProcessingStage
  ) {
    const excessAllocation =
      PaymentReceivedJournal.generateExcessAllocation(amount);

    return this.appendAllocation(
      excessAllocation,
      contact,
      accountToCredit,
      stage
    );
  }

  appendPaymentTotal(
    amount: number,
    contact: IContactSummary,
    account: IAccountSummary,
    stage: IProcessingStage
  ) {
    //
    const entryType = 'debit';
    const entryId = '';
    const transactionType: ITransactionType = 'customer_payment';

    if (stage === 'current') {
      this.appendCurrentEntry({
        entryType,
        account,
        amount,
        entryId,
        transactionType,
        contact,
      });
    } else {
      this.appendIncomingEntry({
        entryType,
        account,
        amount,
        entryId,
        transactionType,
        contact,
      });
    }
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
