import { readJSONFileSync } from '../../../../files';
import { IVehicleModelFromFile, IVehicleModel } from '../../../../types';
import { VehicleMakeModel } from '../../../models';

type ICarModelsFromFile = Record<string, Record<string, IVehicleModelFromFile>>;

export default async function init() {
  console.log('reading file data...');
  const fileData = readJSONFileSync('carModels.json');

  //   console.log('file data', fileData);

  console.log('populating db...');
  await populateDB(fileData);
}

async function populateDB(data: ICarModelsFromFile) {
  if (!data) {
    throw new Error('Invalid vehicle models data from file!');
  }

  const makes = Object.keys(data);

  const metaData = {
    createdAt: new Date(),
    createdBy: 'system',
    modifiedBy: 'system',
    modifiedAt: new Date(),
    orgId: 'all',
    status: 0,
  };

  await Promise.all(
    makes.map(make => {
      const modelsMap = data[make];

      if (!modelsMap) {
        return;
      }

      const makeModels = Object.keys(modelsMap);

      const models: Omit<IVehicleModel, '_id'>[] = [];

      makeModels.forEach(modelKey => {
        const {
          years: yearsArray,
          model: modelName,
          ...modelData
        } = modelsMap[modelKey];

        const yearsString = yearsArray.join(', ');
        console.log({ yearsString, yearsArray });

        models.push({
          ...modelData,
          name: modelName,
          years: yearsString,
          metaData,
        });
      });

      console.log(`make ${make} models: `, models);

    //   const instance = new VehicleMakeModel({
    //     name: make,
    //     models,
    //     metaData,
    //   });

    //   return instance.save();
    })
  );

  console.log('successfully populated db with vehicle models');
}

// init();
