// import { ClientSession, ObjectId } from 'mongodb';
// import BigNumber from 'bignumber.js';

// //
// import { InvoiceModel } from '../../../../models';
// //
// import { PaymentReceived } from '../../paymentsReceived/utils';

// //Sale class
// import { Sale } from '../../utils';

// import {
//   IAccount,
//   IAccountSummary,
//   IInvoiceForm,
//   IInvoiceFromDb,
//   InvoiceTransactionTypes,
//   IInvoice,
//   IAccountsMapping,
//   IAccountMapping,
//   InvoicePayments,
//   ISaleType,
// } from '../../../../../types';
// import InvoicesPayments from '../../paymentsReceived/utils/paymentAllocations';

// // ----------------------------------------------------------------

// export interface InvoiceDetails {
//   invoiceId: string;
//   userId: string;
//   orgId: string;
//   transactionType: keyof InvoiceTransactionTypes;
//   saleType: ISaleType;
// }

// export default class InvoiceSale extends Sale {
//   // incomingInvoice: IInvoiceForm | null;
//   // currentInvoice: Invoice | null;
//   ARAccount: IAccountSummary | null;
//   invoiceId: string;

//   errors: {
//     [key: string]: string;
//   } = { incoming: 'Please provide incoming invoice data' };

//   constructor(session: ClientSession | null, invoiceDetails: InvoiceDetails) {
//     // console.log({ invoiceDetails });
//     const { transactionType, invoiceId, orgId, userId, saleType } =
//       invoiceDetails;

//     super(session, {
//       orgId,
//       userId,
//       transactionId: invoiceId,
//       transactionType,
//       saleType,
//     });

//     this.invoiceId = invoiceId;
//     this.ARAccount = null;

//     // const ARAccount = getAccountData('accounts_receivable', accounts);
//     // if (!ARAccount) {
//     //   throw new Error('Accounts receivable account not found!');
//     // }
//     // this.ARAccount = ARAccount;
//   }

//   async getARAccount() {
//     const { ARAccount } = this;
//     if (ARAccount) {
//       return ARAccount;
//     }

//     const accountId = 'accounts_receivable';
//     // console.log({ accountId });
//     const account = await this.getAccountData(accountId);
//     // console.log({ account });

//     this.ARAccount = account;

//     return account;
//   }

//   getCurrentInvoice() {
//     const { orgId, session, invoiceId } = this;

//     return InvoiceSale.getById(orgId, invoiceId, session);
//   }

//   async createInvoice(
//     incomingInvoice: IInvoiceForm,
//     creditAccountsMapping: IAccountsMapping,
//     debitAccountsMapping: IAccountsMapping
//   ) {
//     const { session, userId, orgId, transactionType, saleType, invoiceId } =
//       this;

//     // create invoice
//     // console.log({ incomingInvoice });

//     // const isOverdue =
//     //   transactionType === 'customer_opening_balance' ? true : false;

//     const instance = new InvoiceModel({
//       ...incomingInvoice,
//       _id: new ObjectId(invoiceId),
//       metaData: {
//         saleType,
//         transactionType,
//         createdAt: new Date(),
//         createdBy: userId,
//         modifiedAt: new Date(),
//         modifiedBy: userId,
//         orgId,
//         status: 0,
//         isSent: false,
//       },
//     });

//     await Promise.all([
//       this.createSale(
//         incomingInvoice,
//         creditAccountsMapping,
//         debitAccountsMapping
//       ),
//       instance.save({ session }),
//     ]);

//     // transaction.create(invoiceRef, {
//     //   ...incomingInvoice,
//     //   balance: incomingInvoice.total,
//     //   paymentsReceived: {},
//     //   paymentsIds: [],
//     //   paymentsCount: 0,
//     //   isOverdue,
//     // });
//   }

//   async updateInvoice(
//     incomingInvoice: IInvoiceForm,
//     currentInvoice: IInvoice,
//     creditAccountsMapping: IAccountsMapping,
//     debitAccountsMapping: IAccountsMapping,
//     currentTotal: number
//   ) {
//     // update invoice
//     const { session, userId, invoiceId, orgId } = this;

//     InvoiceSale.validateUpdate(currentInvoice, incomingInvoice);

//     const { total } = incomingInvoice;

//     /**
//      * calculate balance adjustment
//      */
//     const balanceAdjustment = new BigNumber(total - currentTotal)
//       .dp(2)
//       .toNumber();
//     // console.log({ balanceAdjustment });
//     /**
//      * update invoice
//      */

//     const [result] = await Promise.all([
//       InvoiceModel.findByIdAndUpdate(
//         invoiceId,
//         {
//           $set: {
//             ...incomingInvoice,
//             'metaData.modifiedAt': new Date(),
//             'metaData.modifiedBy': userId,
//             // balance: increment(balanceAdjustment) as unknown as number
//           },
//         },
//         {
//           new: true,
//           session,
//         }
//       ),
//       this.updateSale(
//         incomingInvoice,
//         currentInvoice,
//         creditAccountsMapping,
//         debitAccountsMapping
//       ),
//     ]);

//     const invoiceJSON = result?.toJSON() as IInvoiceFromDb;

//     const updatedInvoice = InvoiceSale.processRawInvoiceResult(invoiceJSON);

//     const paymentsResult = await InvoicesPayments.getInvoicePayments(
//       orgId,
//       invoiceId
//     );

//     const { list: payments, total: paymentsTotal } = paymentsResult;

//     const balance = new BigNumber(total).minus(paymentsTotal).dp(2).toNumber();

//     const processedInvoice: IInvoice = {
//       ...updatedInvoice,
//       balance,
//       payments,
//       paymentsTotal,
//     };

//     return processedInvoice;
//   }

//   async deleteInvoice(
//     currentInvoice: IInvoice,
//     deletedCreditAccounts: IAccountMapping[],
//     deletedDebitAccounts: IAccountMapping[]
//   ) {
//     const { session, userId, invoiceId, orgId } = this;

//     InvoiceSale.validateDelete(currentInvoice);

//     // console.log("deleted accounts", deletedAccounts);

//     /**
//      *
//      */

//     await Promise.all([
//       this.deleteSale(
//         currentInvoice,
//         deletedCreditAccounts,
//         deletedDebitAccounts
//       ),
//       // mark invoice as deleted
//       InvoiceModel.findByIdAndUpdate(
//         invoiceId,
//         {
//           'metaData.status': -1,
//           'metaData.modifiedAt': new Date(),
//           'metaData.modifiedBy': userId,
//         },
//         {
//           session,
//         }
//       ),
//     ]);
//   }

//   // ----------------------------------------------------------------
//   // static methods
//   // ----------------------------------------------------------------

//   // static async createInvoiceId(
//   //   transaction: Transaction,
//   //   orgId: string,
//   //   accounts: Record<string, Account>
//   // ) {
//   //   const summary = new Summary(transaction, orgId, accounts);

//   //   const orgSummaryRef = Summary.createOrgRef(orgId);

//   //   const summaryData = await summary.fetchSummaryData(orgSummaryRef.path);
//   //   console.log({ summaryData });
//   //   const currentInvoices = summaryData?.invoices as number;
//   //   const invoiceNumber = (currentInvoices || 0) + 1;
//   //   const invoiceId = `INV-${String(invoiceNumber).padStart(6, "0")}`;

//   //   return invoiceId;
//   // }

//   //------------------------------------------------------------
//   static validateDelete(invoice: IInvoice) {
//     /**
//      * check if the invoice has payments
//      */
//     const { paymentsTotal } = invoice;
//     console.log('validating invoice deletion:', invoice);

//     if (paymentsTotal > 0) {
//       // deletion not allowed
//       throw new Error(
//         `Invoice Deletion Failed! You cannot delete an invoice that has payments! If you are sure you want to delete it, Please DELETE all the associated PAYMENTS first!`
//       );
//     }
//   }
//   //------------------------------------------------------------
//   static validateUpdate(
//     currentInvoice: IInvoice,
//     incomingInvoice: IInvoiceForm
//     // session?: ClientSession | null
//   ) {
//     const { total, customer: incomingCustomer } = incomingInvoice;
//     const customerId = incomingCustomer?._id || '';
//     const {
//       // paymentsReceived,
//       customer: currentCustomer,
//       paymentsTotal,
//     } = currentInvoice;
//     const currentCustomerId = currentCustomer?._id || '';
//     /**
//      * check to ensure the new total balance is not less than payments made.
//      */
//     // const { total: paymentsTotal } = await PaymentReceived.getInvoicePayments(
//     //   orgId,
//     //   invoiceId,
//     //   session
//     // );

//     /**
//      * trying to update invoice total with an amount less than paymentsTotal
//      * throw an error
//      */
//     if (paymentsTotal > total) {
//       throw new Error(
//         `Invoice Update Failed! The new Invoice Total is less than the invoice payments. If you are sure you want to edit, delete the associated payments or adjust them to be less than or equal to the new invoice total`
//       );
//     }
//     /**
//      * check if customer has been changed
//      */
//     const customerHasChanged = currentCustomerId !== customerId;
//     /**
//      * customer cannot be changed if the invoice has some payments made to it
//      */
//     if (paymentsTotal > 0 && customerHasChanged) {
//       throw new Error(
//         `CUSTOMER cannot be changed in an invoice that has payments! This is because all the payments are from the PREVIOUS customer. If you are sure you want to change the customer, DELETE the associated payments first!`
//       );
//     }
//   }

//   //------------------------------------------------------------
//   // static async createInvoiceId(orgId: string) {
//   //   const invoicesCollection = dbCollections(orgId).invoices;

//   //   const snap = await invoicesCollection
//   //     .orderBy('createdAt', 'desc')
//   //     .limit(1)
//   //     .get();

//   //   let prevInvoice = 0;

//   //   if (snap.docs.length > 0) {
//   //     prevInvoice = Number(snap.docs[0].id);
//   //   }

//   //   const invoiceNumber = prevInvoice + 1;
//   //   // const invoiceId = `INV-${String(invoiceNumber).padStart(6, "0")}`;

//   //   return `${invoiceNumber}`;
//   // }
//   //------------------------------------------------------------

//   static async getById(
//     orgId: string,
//     invoiceId: string,
//     session?: ClientSession | null
//   ) {
//     const [invoice, paymentsResult] = await Promise.all([
//       InvoiceSale.getByIdRaw(invoiceId, session || null),
//       PaymentReceived.getInvoicePayments(orgId, invoiceId, session),
//     ]);

//     // console.log({ paymentsTotal });

//     if (!invoice) {
//       throw new Error('Invoice not found!');
//     }

//     const { total } = invoice;
//     const { list: payments, total: paymentsTotal } = paymentsResult;

//     const balance = new BigNumber(total).minus(paymentsTotal).dp(2).toNumber();

//     // console.log('get invoice by id payments result', {
//     //   balance,
//     //   paymentsTotal,
//     //   total,
//     // });

//     const processedInvoice: IInvoice = {
//       ...invoice,
//       balance,
//       payments,
//       paymentsTotal,
//     };

//     return processedInvoice;
//   }

//   //----------------------------------------------------------------

//   // static retrieveInvoiceFromSnap(snap: DocumentSnapshot<IInvoiceFromDb>) {
//   //   const data = snap.data();
//   //   const id = snap.id;

//   //   if (!snap.exists || data?.status === -1 || data === undefined) {
//   //     throw new Error(`Invoice with id ${id} not found!`);
//   //   }

//   //   const invoice: Invoice = {
//   //     ...data,
//   //     id,
//   //   };

//   //   return invoice;
//   // }

//   //------------------------------------------------------------------
//   // static getInvoicePayments(payments: InvoicePayments) {
//   //   const total = Object.keys(payments).reduce((sum, key) => {
//   //     const payment = new BigNumber(payments[key]);
//   //     return sum.plus(payment);
//   //   }, new BigNumber(0));

//   //   return total.dp(2).toNumber();
//   // }

//   static processRawInvoiceResult(invoiceFromDb: IInvoiceFromDb) {
//     const subTotal = +invoiceFromDb.subTotal.toString();
//     const totalTax = +invoiceFromDb.totalTax?.toString();
//     const total = +invoiceFromDb.total.toString();
//     //
//     const _id = invoiceFromDb._id.toString();

//     const invoice: IInvoice = {
//       ...invoiceFromDb,
//       _id,
//       subTotal,
//       totalTax,
//       total,
//       balance: 0,
//     };

//     return invoice;
//   }

//   static async getByIdRaw(invoiceId: string, session?: ClientSession | null) {
//     console.log('getInvoice by id called');
//     if (!invoiceId) {
//       throw new Error('Invalid Params: Errors in params [invoiceId]!');
//     }

//     console.log('executing getInvoice by id');
//     // console.log('fetching vehicle for id ' + invoiceId);

//     const [result] = await Promise.all([
//       InvoiceModel.findById(invoiceId, {}, { session }).exec(),
//     ]);
//     console.log({ result });

//     if (!result) {
//       return null;
//     }

//     const invoiceJSON = result.toJSON() as IInvoiceFromDb;

//     const invoice = this.processRawInvoiceResult(invoiceJSON);

//     //
//     console.log({ invoice });

//     return invoice;
//   }

//   //----------------------------------------------------------------
//   static reformatDates(data: IInvoiceForm): IInvoiceForm {
//     const { saleDate, dueDate } = data;
//     const formData = {
//       ...data,
//       saleDate: new Date(saleDate),
//       dueDate: new Date(dueDate),
//     };

//     return formData;
//   }
//   //----------------------------------------------------------------
// }

function pikin() {}
