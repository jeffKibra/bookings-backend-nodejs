import Filters from './Filters';

const InvoicesFieldsMap: Filters['fieldsMap'] = {
  customerId: { path: 'customer._id', type: 'normal' },
};

export default class InvoicesFilters extends Filters {
  constructor(orgId: Filters['orgId']) {
    super(orgId, InvoicesFieldsMap);
  }
}
