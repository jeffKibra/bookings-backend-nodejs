import Filters from './Filters';

const ContactsFieldsMap: Filters['fieldsMap'] = {
  group: { path: 'metaData.group', type: 'normal' },
};

export default class ContactsFilters extends Filters {
  constructor(orgId: Filters['orgId']) {
    super(orgId, ContactsFieldsMap);
  }
}
