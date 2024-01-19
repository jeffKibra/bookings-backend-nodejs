import retrieveSimilarModel from './retrieveSimilarModel';

export default async function checkModelName(
  make: string,
  modelName: string,
  modelId: string = ''
) {
  const similarModel = await retrieveSimilarModel(make, modelName, modelId);
  console.log({ similarModel });

  const similarModelExists = Boolean(similarModel);

  if (similarModelExists) {
    throw new Error('The model name must be unique!');
  }
}
