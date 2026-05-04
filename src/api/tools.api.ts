import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type SalaryMode = "GROSS_TO_NET" | "NET_TO_GROSS";

export interface SalaryCalculatorRequest {
  mode: SalaryMode;
  amount: number;
  region: 1 | 2 | 3 | 4;
  dependents: number;
  insuranceBase?: number;
}

export interface SalaryBreakdown {
  gross: number;
  net: number;
  insuranceBase: number;
  socialInsurance: number; // BHXH (8%)
  healthInsurance: number; // BHYT (1.5%)
  unemploymentInsurance: number; // BHTN (1%)
  totalInsurance: number;
  taxableIncome: number;
  personalDeduction: number;
  dependentDeduction: number;
  incomeTax: number;
}

export const toolsApi = {
  calculateSalary: (data: SalaryCalculatorRequest) =>
    api.post<ApiResponse<SalaryBreakdown>>("/tools/salary-calculator", data),
};
