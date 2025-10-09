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

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}
