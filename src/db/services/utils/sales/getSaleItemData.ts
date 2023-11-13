// import { SaleItem, Item, Tax } from "../../types";

// interface SelectedItemData {
//   itemId: string;
//   rate: number;
//   quantity: number;
//   saleTax?: Tax;
// }

export default function getSaleItemData() {
  // saleItem: SelectedItemData,
  // item: Item
  // // console.log({ data });
  // const { rate, quantity, saleTax } = saleItem;
  // const { saleTaxType } = item;
  // let itemRate = rate;
  // let itemTax = 0;
  // //set all rates to be tax exclusive
  // if (saleTax?.rate) {
  //   if (saleTaxType === "tax inclusive") {
  //     //item rate is inclusive of tax
  //     const tax = (saleTax.rate / (100 + saleTax.rate)) * rate;
  //     itemRate = rate - tax;
  //   }
  //   //compute final tax after discounts
  //   itemTax = (saleTax.rate / 100) * itemRate;
  // }
  // /**
  //  * finally compute amounts based on item quantity
  //  */
  // const itemRateTotal = itemRate * quantity;
  // const itemTaxTotal = itemTax * quantity;
  // const itemData: SaleItem = {
  //   item: { ...item },
  //   rate,
  //   quantity,
  //   itemRate: +itemRate.toFixed(2),
  //   itemTax: +itemTax.toFixed(2),
  //   itemRateTotal: +itemRateTotal.toFixed(2),
  //   itemTaxTotal: +itemTaxTotal.toFixed(2),
  // };
  // if (saleTax?.rate) {
  //   itemData.saleTax = saleTax;
  // }
  // // console.log({ itemData });
  // return itemData;
}
