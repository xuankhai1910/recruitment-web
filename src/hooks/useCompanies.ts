import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, type CompanyQueryParams } from '@/api/companies.api';
import type { CreateCompanyDto, UpdateCompanyDto } from '@/types/company';
import { toast } from 'sonner';

export function useCompanies(params: CompanyQueryParams) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => companiesApi.getList(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Tạo công ty thành công');
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      companiesApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Cập nhật thành công');
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Đã xóa công ty');
    },
  });
}
