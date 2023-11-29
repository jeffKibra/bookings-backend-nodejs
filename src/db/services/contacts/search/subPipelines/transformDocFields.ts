const transformDocFields = {
  _id: {
    $toString: '$_id',
  },
  openingBalance: {
    $toDouble: '$openingBalance',
  },
};

export default transformDocFields;
