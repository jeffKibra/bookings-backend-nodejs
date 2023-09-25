import { PipelineStage } from 'mongoose';

export default function generateSearchPipelineStages(
  orgId: string,
  query: string | number
) {
  const stages: PipelineStage[] = [
    {
      $search: {
        compound: {
          must: [
            ...(query
              ? [
                  {
                    text: {
                      path: [
                        'registration',
                        'make',
                        'model',
                        'color',
                        'description',
                      ],
                      query,
                      fuzzy: {},
                    },
                  },
                ]
              : []),
          ],
          filter: [
            {
              text: {
                path: 'metaData.orgId',
                query: orgId,
              },
            },
            {
              equals: {
                path: 'metaData.status',
                value: 0,
              },
            },
          ],
        },

        // sort: {
        //   rate: 1,
        // },
      },
    },
  ];

  return stages;
}
