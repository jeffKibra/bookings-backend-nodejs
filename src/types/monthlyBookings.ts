export type IDatesMapping = Record<string, string>;

export interface IGroupedDatesMapping {
  incoming: IDatesMapping;
  unModified: IDatesMapping;
  deleted: IDatesMapping;
}

export type IBookingDatesMapping = Record<string, IGroupedDatesMapping>;
