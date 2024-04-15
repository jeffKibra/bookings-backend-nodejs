import { PipelineStage } from 'mongoose';
import { ContactModel } from '../../../models';
//
import { ContactsFilters } from '../../utils/filters';
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

  const userFilters = {
    ...(contactGroup ? { group: [contactGroup] } : {}),
  };

  const filters = new ContactsFilters(orgId).generateSearchFilters(
    query,
    userFilters
  );
  console.log('autocomplete filters', filters);

  const searchPipelineStages = generateSearchStages(query, filters);
  console.log('autocomplete searchPipelineStages', searchPipelineStages);

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
