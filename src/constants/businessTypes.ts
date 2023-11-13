type BusinessType = {
  name: string;
  value: string;
};

const businessTypes: BusinessType[] = [
  {
    name: "Sole trader",
    value: "sole_trader",
  },
  {
    name: "Partnership",
    value: "partnership",
  },
  {
    name: "Private limited company",
    value: "private_limited_company",
  },
  {
    name: "Traded company | Co-operative",
    value: "traded_company",
  },
  {
    name: "Charity | Association",
    value: "charity",
  },
  {
    name: "Company",
    value: "company",
  },
  {
    name: "Others",
    value: "others",
  },
];

export default businessTypes;
