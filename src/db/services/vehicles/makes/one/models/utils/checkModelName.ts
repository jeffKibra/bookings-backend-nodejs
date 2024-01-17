import retrieveSimilarModel from './retrieveSimilarModel';

export default async function checkModelName(
  makeId: string,
  modelName: string,
  modelId: string = ''
) {
  const similarModel = await retrieveSimilarModel(makeId, modelName, modelId);
  console.log({ similarModel });

  const similarModelExists = Boolean(similarModel);

  if (similarModelExists) {
    throw new Error('The model name must be unique!');
  }
}
