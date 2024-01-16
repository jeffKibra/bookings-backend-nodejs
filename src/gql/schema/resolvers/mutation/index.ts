//
import contactsResolvers from './contacts';
import vehicleMakesAndModelsResolvers from './vehicleMakesAndModels';
import vehiclesResolvers from './vehicles';
import salesResolvers from './sales';
import orgsResolvers from './orgs';

const mutationResolvers = {
  ...orgsResolvers,
  ...contactsResolvers,
  ...vehicleMakesAndModelsResolvers,
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default mutationResolvers;
