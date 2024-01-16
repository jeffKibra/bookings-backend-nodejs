import salesResolvers from './sales';
import vehicleMakesAndModelsResolvers from './vehicleMakesAndModels';
import vehiclesResolvers from './vehicles';
import orgsResolvers from './orgs';
import contactsResolvers from './contacts';

const queryResolvers = {
  ...orgsResolvers,
  ...contactsResolvers,
  ...vehicleMakesAndModelsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default queryResolvers;
