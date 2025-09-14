export type Frequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface Salary {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  paymentDate: string;
  frequency: Frequency;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryCreater {
  userId: string;
  amount: number;
  description: string | null;
  paymentDate: string;
  frequency: Frequency;
  isRecurring: boolean;
  createdAt: string;
}

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
  categoryId: string | null;
}

export interface TransactionPropsCreater {
  userId: string;
  description?: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId?: string | null;
}

export interface Transaction {
  userId: string;
  description: string | null;
  type: TransactionType;
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  recurringId: string | null;
  fixedId: string | null;
  categoryId: string | null;
}
