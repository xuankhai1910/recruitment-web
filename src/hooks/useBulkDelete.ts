import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseBulkDeleteOptions {
  queryKey?: QueryKey;
  queryKeys?: QueryKey[];
  deleteFn: (id: string) => Promise<unknown>;
  successMessage: (count: number) => string;
}

export function useBulkDelete({
  queryKey,
  queryKeys,
  deleteFn,
  successMessage,
}: UseBulkDeleteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteFn(id)));
      return ids.length;
    },
    onSuccess: async (count) => {
      const keys = queryKeys ?? (queryKey ? [queryKey] : []);
      await Promise.all(
        keys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
      );
      toast.success(successMessage(count));
    },
  });
}
