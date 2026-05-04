import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { toolsApi, type SalaryCalculatorRequest } from "@/api/tools.api";

export function useCalculateSalary() {
  return useMutation({
    mutationFn: (data: SalaryCalculatorRequest) =>
      toolsApi.calculateSalary(data).then((r) => r.data.data),
    onError: () => {
      toast.error("Không thể tính lương. Vui lòng thử lại.");
    },
  });
}
