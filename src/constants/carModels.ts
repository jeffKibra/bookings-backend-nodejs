import { FieldValue } from "firebase-admin/firestore";

const { serverTimestamp } = FieldValue;

const modelsMap: string[] = [
  "toyota_corolla_2022",
  "nissan_GT-R_2023",
  "Audi_A3_2022",
  "Mercedes-Benz_GLA_2022",
  "Subaru_imprezza_2022",
  "jeep_gladiator_2022",
  "Lexus_GX_2022",
  "BMW_i4_2022",
  "Honda_Accord_2022",
];

const models = modelsMap.reduce((acc, string) => {
  console.log({ string });
  const [make, model, yr] = String(string).split("_");
  const year = Number(yr);

  return {
    ...acc,
    [string]: {
      year,
      make,
      model,
      id: string,
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
    },
  };
}, {});

console.log({ models });

export default models;
