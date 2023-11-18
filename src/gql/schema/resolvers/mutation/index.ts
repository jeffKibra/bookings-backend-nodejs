//
import vehiclesResolvers from './vehicles';
import salesResolvers from './sales';

const mutationResolvers = {
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default mutationResolvers;
