import Filters from './Filters';

const vehiclesFieldsMap: Filters['fieldsMap'] = {
  rate: { path: 'rate', type: 'range' },
  color: { path: 'color', type: 'normal' },
  model: { path: 'model.name', type: 'normal' },
  make: { path: 'model.make', type: 'normal' },
  type: { path: 'model.type', type: 'normal' },
};

export default class VehiclesFilters extends Filters {
  constructor(orgId: Filters['orgId']) {
    super(orgId, vehiclesFieldsMap);
  }
}
