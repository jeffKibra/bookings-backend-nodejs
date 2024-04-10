export default class StaticFilters {
  static status = 0;
  static orgIdFieldPath = 'metaData.orgId';
  static statusFieldPath = 'metaData.status';

  //
  orgId: string;
  //

  constructor(orgId: StaticFilters['orgId']) {
    this.orgId = orgId;
  }

  generateStaticFields() {
    const { orgId } = this;

    return StaticFilters.generateStaticFields(orgId);
  }

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

  //--------------------------------------------------------------------
}
