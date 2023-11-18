import { IContactSummary } from '../types';

//
export const DRAWER_WIDTH = 230;
export const BAR_HEIGHT = 64;

export { default as carModels } from './carModels';
export { default as accountTypes } from './accountTypes';
// export { default as accounts } from './accounts';
export { generateAccounts } from './accounts';
export { default as paymentModes } from './paymentModes';
export { default as paymentTerms } from './paymentTerms';
export { default as businessTypes } from './businessTypes';
export * as ledger from './ledgers';

export const walkInCustomer: IContactSummary = {
  displayName: 'Walk-in Customer',
  _id: 'walk_in_customer',
};
