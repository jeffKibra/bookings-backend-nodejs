export default class StaticFilters {
  static status = 0;
  static orgIdFieldPath = 'metaData.orgId';
  static statusFieldPath = 'metaData.status';

  //
  // orgId: string;
  //

  constructor() {
    // this.orgId = orgId;
  }

  // generateStaticFields() {
  //   const { orgId } = this;

  //   return StaticFilters.generateStaticFields(orgId);
  // }

  //-------------------------------------------------------------------------
  //static methods
  //-------------------------------------------------------------------------
  static generateStaticFields(orgId: string) {
    const { orgIdFieldPath, statusFieldPath } = StaticFilters;

    const fields = {
      orgId: { path: orgIdFieldPath, value: orgId },
      status: { path: statusFieldPath, value: 0 },
    };

    return fields;
  }

  static generateForSearch(orgId: string) {
    const {
      orgId: { path: orgIdPath, value: orgIdValue },
      status: { path: statusPath, value: statusValue },
    } = this.generateStaticFields(orgId);

    const searchFilters = [
      {
        text: {
          path: orgIdPath,
          query: orgIdValue,
        },
      },
      {
        equals: {
          path: statusPath,
          value: statusValue,
        },
      },
    ];

    return searchFilters;
  }

  static generateForMatch(orgId: string) {
    const {
      orgId: { path: orgIdPath, value: orgIdValue },
      status: { path: statusPath, value: statusValue },
    } = this.generateStaticFields(orgId);

    const matchFilters = {
      [orgIdPath]: orgIdValue,
      [statusPath]: statusValue,
    };

    return matchFilters;
  }

  //--------------------------------------------------------------------
}
