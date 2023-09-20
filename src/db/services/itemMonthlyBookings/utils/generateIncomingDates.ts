export default function generateIncomingDates(
  itemBookingDatesFromDB: string[],
  selectedDates: string[],
  deletedDates: string[]
) {
  //create currentDates mapping for quick lookup
  const currentDatesMapping: Record<string, string> = {};
  itemBookingDatesFromDB.forEach(dateString => {
    currentDatesMapping[dateString] = dateString;
  });
  //
  //loop through deleted dates list. delete date currentDates
  deletedDates.forEach(dateString => {
    delete currentDatesMapping[dateString];
  });

  const incomingDates = Object.keys(currentDatesMapping).concat(selectedDates);

  return incomingDates;
}
