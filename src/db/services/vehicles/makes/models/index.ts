import archive from './archive';
import create from './create';
import update from './update';
//
import get from './get';

//

export default function models(orgId: string, make: string) {
  const customThis = { make, orgId };

  if (!orgId || !make) {
    throw new Error('Error initializing models: Missing Params!');
  }

  return {
    create: create.bind(customThis),
    update: update.bind(customThis),
    archive: archive.bind(customThis),
    get: get.bind(customThis),
  };
}
