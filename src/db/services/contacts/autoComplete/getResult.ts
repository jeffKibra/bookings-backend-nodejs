import { PipelineStage } from 'mongoose';
import { ContactModel } from '../../../models';
//
import { generateSearchStages } from './subPipelines';
//
import { sort, pagination } from '../../utils';

//
import { IContact, ISearchContactsQueryOptions } from '../../../../types';
//

type FacetPipelineStage = PipelineStage.FacetPipelineStage;

//----------------------------------------------------------------

//

//----------------------------------------------------------------

export default async function getResult(
  orgId: string,
  query: string | number,
  contactGroup: string
) {
  // console.log('options', options);

  const filters = {
    ...(contactGroup ? { group: [contactGroup] } : {}),
  };

  const searchPipelineStages = generateSearchStages(orgId, query, filters);

  // aggregation to fetch items not booked.
  return ContactModel.aggregate<IContact[]>([
    ...searchPipelineStages,
    {
      $sort: {
        searchScore: -1,
        _id: -1,
      },
    },

    {
      $limit: query ? 15 : 10,
    },
    {
      $project: {
        _id: 1,
        displayName: 1,
        companyName: 1,
        firstName: 1,
        lastName: 1,
        type: 1,
        paymentTerm: 1,
        searchScore: 1,
      },
    },
  ]);
}
