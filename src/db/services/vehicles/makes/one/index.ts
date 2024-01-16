import get from './get';
//
import * as models from './models';

export default function one(orgId: string, makeId: string) {
  const customThis = { makeId, orgId };

  return {
    get: get.bind(customThis),
    models: {
      create: models.create.bind(customThis),
      update: models.update.bind(customThis),
      archive: models.archive.bind(customThis),
      get: models.get.bind(customThis),
    },
  };
}
