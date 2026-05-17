import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryKey = {
  all: ["customers"] as const,
  details: () => [...queryKey.all, "detail"] as const,
  detail: (id: number) => [...queryKey.details(), id] as const,
};

export function useCustomersList() {
  return useQuery<any[]>({
    queryKey: queryKey.all,
    queryFn: api.customers.list,
    placeholderData: [],
  });
}

export function useCustomerDetails(id: number) {
  return useQuery<any>({
    queryKey: queryKey.detail(id),
    queryFn: () => api.customers.get(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.customers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}
