import { api } from "../lib/axios";
import { Salary, SalaryCreater } from "../types/interfaces";

export class SalaryService {
  /**
   * Criar salario
   */
  static async create(SalaryData: SalaryCreater): Promise<Salary> {
    try {
      const response = await api.post<Salary>("/salary/creater", SalaryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  /**
   *  salario
   */
  static async updater(SalaryData: Salary): Promise<Salary> {
    try {
      const response = await api.put<Salary>("/salary/update", SalaryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
