import { TransactionPropsCreater, TransactionType } from "./transaction-props";

export enum Frequency {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  QUARTERLY = "QUARTERLY",
}

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

export interface SalaryUpdateResponse {
  success: boolean;
  newSalary: number;
  previousSalary: number;
}
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface Transaction extends TransactionPropsCreater {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
