import salesResolvers from './sales';
import vehiclesResolvers from './vehicles';

const queryResolvers = {
  ...vehiclesResolvers,
  ...salesResolvers,
};

export default queryResolvers;
