import { FieldValue } from "firebase-admin/firestore";

import accountTypes from "./accountTypes";

import { AccountFromDb } from "../types";

type AccountsType = {
  [key: string]: {
    accountType: string;
    name: string;
    tags: string[];
    description: string;
  };
};

export const Assets: AccountsType = {
  prepaid_expenses: {
    accountType: "other_current_asset",
    name: "Prepaid Expenses",
    tags: ["system", "receivable"],
    description:
      "An asset account that reports amounts paid in advance while purchasing goods or services from a vendor.",
  },
  advance_tax: {
    accountType: "other_current_asset",
    name: "Advance Tax",
    tags: ["system", "receivable", "payable"],
    description:
      "Any tax which is paid in advance is recorded into the advance tax account. This advance tax payment could be a quarterly, half yearly or yearly payment.",
  },
  employee_advance: {
    accountType: "other_current_asset",
    name: "Employee Advance",
    tags: ["system", "receivable", "payable"],
    description:
      "Money paid out to an employee in advance can be tracked here till it's repaid or shown to be spent for company purposes.",
  },
  undeposited_funds: {
    accountType: "cash",
    name: "Undeposited Funds",
    tags: ["system", "receivable"],
    description:
      "Record funds received by your company yet to be deposited in a bank as undeposited funds and group them as a current asset in your balance sheet.",
  },
  petty_cash: {
    accountType: "cash",
    name: "Petty Cash",
    tags: ["system", "receivable"],
    description:
      "It is a small amount of cash that is used to pay your minor or casual expenses rather than writing a check.",
  },
  accounts_receivable: {
    accountType: "accounts_receivable",
    name: "Accounts Receivable",
    tags: ["system"],
    description:
      "The money that customers owe you becomes the accounts receivable. A good example of this is a payment expected from an invoice sent to your customer.",
  },
  furniture_and_equipment: {
    accountType: "fixed_asset",
    name: "Furniture and Equipment",
    tags: ["system", "receivable", "payable"],
    description:
      "Purchases of furniture and equipment for your office that can be used for a long period of time usually exceeding one year can be tracked with this account.",
  },
  inventory_asset: {
    accountType: "stock",
    name: "Inventory Asset",
    tags: ["system"],
    description:
      "An account which tracks the value of goods in your inventory.",
  },
};

export const Liabilities: AccountsType = {
  tax_payable: {
    accountType: "other_current_liability",
    name: "Tax Payable",
    tags: ["system", "payable"],
    description:
      "The amount of money which you owe to your tax authority is recorded under the tax payable account. This amount is a sum of your outstanding in taxes and the tax charged on sales.",
  },
  unearned_revenue: {
    accountType: "other_current_liability",
    name: "Unearned Revenue",
    tags: ["system"],
    description:
      "A liability account that reports amounts received in advance of providing goods or services. When the goods or services are provided, this account balance is decreased and a revenue account is increased.",
  },
  opening_balance_adjustments: {
    accountType: "other_current_liability",
    name: "Opening Balance Adjustments",
    tags: ["system", "receivable"],
    description:
      "This account will hold the difference in the debits and credits entered during the opening balance.",
  },
  employee_reimbursements: {
    accountType: "other_current_liability",
    name: "Employee Reimbursements",
    tags: ["system", "receivable", "payable"],
    description:
      "This account can be used to track the reimbursements that are due to be paid out to employees.",
  },
  accounts_payable: {
    accountType: "accounts_payable",
    name: "Accounts Payable",
    tags: ["system"],
    description:
      "This is an account of all the money which you owe to others e.g. a pending bill payment to a vendor.",
  },
  tag_adjustments: {
    accountType: "other_liability",
    name: "Tag Adjustments",
    tags: ["system"],
    description:
      "This adjustment account tracks the transfers between different reporting tags.",
  },
};

export const Equity: AccountsType = {
  retained_earnings: {
    accountType: "equity",
    name: "Retained Earnings",
    tags: ["system"],
    description:
      "The earnings of your company which are not distributed among the share holders is accounted as retained earnings.",
  },
  owners_equity: {
    accountType: "equity",
    name: "Owners Equity",
    tags: ["system", "receivable"],
    description:
      "The owners rights to the assets of a company can be quantified in the owner''s equity account.",
  },
  opening_balance_offset: {
    accountType: "equity",
    name: "Opening Balance Offset",
    tags: ["system", "receivable"],
    description:
      "This is an account where you can record the balance from your previous years earning or the amount set aside for some activities. It is like a buffer account for your funds.",
  },
  drawings: {
    accountType: "equity",
    name: "Drawings",
    tags: ["system", "receivable"],
    description:
      "The money withdrawn from a business by its owner can be tracked with this account.",
  },
};

export const Income: AccountsType = {
  other_charges: {
    accountType: "income",
    name: "Other Charges",
    tags: ["system"],
    description:
      "Miscellaneous charges like adjustments made to the invoice can be recorded in this account.",
  },
  sales: {
    accountType: "income",
    name: "Sales",
    tags: ["system"],
    description:
      "The income from the sales in your business is recorded under the sales account.",
  },
  general_income: {
    accountType: "income",
    name: "General Income",
    tags: ["system"],
    description:
      "A general category of account where you can record any income which cannot be recorded into any other category.",
  },
  interest_income: {
    accountType: "income",
    name: "Interest Income",
    tags: ["system"],
    description:
      "A percentage of your balances and deposits are given as interest to you by your banks and financial institutions. This interest is recorded into the interest income account.",
  },
  late_fee_income: {
    accountType: "income",
    name: "Late Fee Income",
    tags: ["system"],
    description:
      "Any late fee income is recorded into the late fee income account. The late fee is levied when the payment for an invoice is not received by the due date.",
  },
  discount: {
    accountType: "income",
    name: "Discount",
    tags: ["system"],
    description:
      "Any reduction on your selling price as a discount can be recorded into the discount account.",
  },
  shipping_charge: {
    accountType: "income",
    name: "Shipping Charge",
    tags: ["system"],
    description:
      "Shipping charges made to the invoice will be recorded in this account.",
  },
  vehicle_bookings: {
    accountType: "income",
    name: "Vehicle Bookings",
    tags: ["system"],
    description:
      "Vehicle bookings  made to the invoice will be recorded in this account.",
  },
  transfer_charge: {
    accountType: "income",
    name: "Transfer Charge",
    tags: ["system"],
    description: "Transfer charges are recorded in this account.",
  },
};

export const Expenses: AccountsType = {
  lodging: {
    accountType: "expense",
    name: "Lodging",
    tags: ["system", "payable"],
    description:
      "Any expense related to putting up at motels etc while on business travel can be entered here.",
  },
  purchase_discounts: {
    accountType: "expense",
    name: "Purchase Discounts",
    tags: ["system", "payable"],
    description:
      "Tracks any reduction that your vendor offers on your purchases. Some vendors also provide them to encourage quick payment settlement.",
  },
  office_supplies: {
    accountType: "expense",
    name: "Office Supplies",
    tags: ["system", "payable"],
    description:
      "All expenses on purchasing office supplies like stationery are recorded into the office supplies account.",
  },
  advertising_and_marketing: {
    accountType: "expense",
    name: "Advertising and Marketing",
    tags: ["system", "payable"],
    description:
      " Your expenses on promotional, marketing and advertising activities like banners, web-adds, trade shows, etc. are recorded in advertising and marketing account.",
  },
  bank_fees_and_charges: {
    accountType: "expense",
    name: "Bank Fees and Charges",
    tags: ["system", "payable"],
    description:
      "Any bank fees levied is recorded into the bank fees and charges account. A bank account maintenance fee, transaction charges, a late payment fee are some examples.",
  },
  credit_card_charges: {
    accountType: "expense",
    name: "Credit Card Charges",
    tags: ["system", "payable"],
    description:
      "Service fees for transactions , balance transfer fees, annual credit fees and other charges levied on a credit card are recorded into the credit card account.",
  },
  travel_expense: {
    accountType: "expense",
    name: "Travel Expense",
    tags: ["system", "payable"],
    description: "",
  },
  telephone_expense: {
    accountType: "expense",
    name: "Telephone Expense",
    tags: ["system", "payable"],
    description: "",
  },
  automobile_expense: {
    accountType: "expense",
    name: "Automobile Expense",
    tags: ["system", "payable"],
    description:
      "Transportation related expenses like fuel charges and maintenance charges for automobiles, are included to the automobile expense account.",
  },
  it_and_internet_expense: {
    accountType: "expense",
    name: "IT and Internet Expense",
    tags: ["system", "payable"],
    description: "",
  },
  rent_expense: {
    accountType: "expense",
    name: "Rent Expense",
    tags: ["system", "payable"],
    description: "",
  },
  janitorial_expense: {
    accountType: "expense",
    name: "Janitorial Expense",
    tags: ["system", "payable"],
    description: "janitorial and cleaning expenses",
  },
  postage: {
    accountType: "expense",
    name: "Postage",
    tags: ["system", "payable"],
    description:
      "Your expenses on ground mails, shipping and air mails can be recorded under the postage account.",
  },
  bad_debt: {
    accountType: "expense",
    name: "Bad Debt",
    tags: ["system", "payable"],
    description:
      "Any amount which is lost and is unrecoverable is recorded into the bad debt account.",
  },
  printing_and_stationery: {
    accountType: "expense",
    name: "Printing and Stationery",
    tags: ["system", "payable"],
    description: "Expenses incurred towards printing and stationery.",
  },
  salaries_and_employee_wages: {
    accountType: "expense",
    name: "Salaries and Employee Wages",
    tags: ["system", "payable"],
    description: "",
  },
  meals_and_entertainment: {
    accountType: "expense",
    name: "Meals and Entertainment",
    tags: ["system", "payable"],
    description: "",
  },
  depreciation_expense: {
    accountType: "expense",
    name: "Depreciation Expense",
    tags: ["system", "payable"],
    description:
      "Any depreciation in value of your assets can be captured as a depreciation expense.",
  },
  consultant_expense: {
    accountType: "expense",
    name: "Consultant Expense",
    tags: ["system", "payable"],
    description:
      "Charges for availing the services of a consultant is recorded as a consultant expenses.",
  },
  repairs_and_maintenance: {
    accountType: "expense",
    name: "Repairs and Maintenance",
    tags: ["system", "payable"],
    description: "",
  },
  other_expenses: {
    accountType: "expense",
    name: "Other Expenses",
    tags: ["system", "payable"],
    description:
      "Any minor expense on activities unrelated to primary business operations is recorded under the other expense account.",
  },
  cost_of_goods_sold: {
    accountType: "cost_of_goods_sold",
    name: "Cost of Goods Sold",
    tags: ["system", "payable"],
    description: "An expense account which tracks the value of the goods sold.",
  },
  uncategorized: {
    accountType: "expense",
    name: "Uncategorized",
    tags: ["system"],
    description:
      "This account can be used to temporarily track expenses that are yet to be identified and classified into a particular category",
  },
  exchange_gain_or_loss: {
    accountType: "other_expense",
    name: "Exchange Gain or Loss",
    tags: ["system"],
    description:
      "Changing the conversion rate of currencies can result in a gain or a loss. You can record this into the exchange gain or loss account.",
  },
};

const allAccounts: AccountsType = {
  ...Assets,
  ...Liabilities,
  ...Equity,
  ...Income,
  ...Expenses,
};

const { serverTimestamp } = FieldValue;

export function generateAccounts() {
  const accounts = Object.entries(allAccounts).reduce(
    (
      accountsObj: { [key: string]: AccountFromDb },
      [accountId, accountData]
    ) => {
      const { accountType, ...rest } = accountData;
      // console.log({ key, accountType });

      const account: AccountFromDb = {
        ...rest,
        accountId,
        accountType: {
          id: accountType,
          ...accountTypes[accountType],
        },
        status: 0,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
        createdBy: "system",
        modifiedBy: "system",
      };

      return {
        ...accountsObj,
        [accountId]: account,
      };
    },
    {}
  );

  return accounts;
}

const accounts = generateAccounts();

export default accounts;
