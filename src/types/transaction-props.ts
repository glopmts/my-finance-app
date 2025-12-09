export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface TransactionProps {
  userId: string;
  description?: string | null;
  type: TransactionType;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId?: string | null;
  category: CategoryEnum;
  financialGoalsId?: string | null;
  paymentSource: PaymentSource;
}

export interface TransactionPropsCreater {
  userId: string;
  description?: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId?: string | null;
  category: CategoryEnum;
  financialGoalsId?: string | null;
  paymentSource: PaymentSource;
}

export type CategoryEnum =
  | "TRANSPORTATION"
  | "FOOD"
  | "ACCOMMODATION"
  | "ENTERTAINMENT"
  | "HEALTHCARE"
  | "EDUCATION"
  | "UTILITIES"
  | "INVESTMENTS"
  | "SHOPPING"
  | "OTHER";

export enum CategoryEnumProps {
  TRANSPORTATION = "TRANSPORTATION",
  FOOD = "FOOD",
  ACCOMMODATION = "ACCOMMODATION",
  ENTERTAINMENT = "ENTERTAINMENT",
  HEALTHCARE = "HEALTHCARE",
  EDUCATION = "EDUCATION",
  UTILITIES = "UTILITIES",
  INVESTMENTS = "INVESTMENTS",
  SHOPPING = "SHOPPING",
  OTHER = "OTHER",
}

export type PaymentSource =
  | "SALARY"
  | "CREDIT_CARD"
  | "CASH"
  | "PIX"
  | "DEBIT_CARD"
  | "INVESTMENT";

export const PAYMENTSOURCE_TRANSLATIONS = {
  PIX: "Pix",
  DEBIT_CARD: "Debito Cartão",
  INVESTMENT: "Investimentos",
  SALARY: "Salario",
  CREDIT_CARD: "Cartão credito",
  CASH: "Dinheiro",
} as const;

export interface Transaction {
  userId: string;
  description?: string | null;
  type: TransactionType;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId?: string | null;
  category: CategoryEnum;
  financialGoalsId?: string | null;
  paymentSource: PaymentSource;
}

export interface TransactionUpdateProps {
  id: string;
  userId: string;
  description?: string | null;
  type?: TransactionType;
  amount?: number;
  date?: string;
  isRecurring?: boolean;
  recurringId?: string | null;
  category: CategoryEnum;
  financialGoalsId?: string | null;
  paymentSource: PaymentSource;
}
