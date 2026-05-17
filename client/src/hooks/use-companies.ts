import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryKey = {
  all: ["companies"] as const,
  details: () => [...queryKey.all, "detail"] as const,
  detail: (id: number) => [...queryKey.details(), id] as const,
};

export function useCompaniesList() {
  return useQuery<any[]>({
    queryKey: queryKey.all,
    queryFn: api.companies.list,
    placeholderData: [],
  });
}

export function useCompanyDetails(id: number) {
  return useQuery<any>({
    queryKey: queryKey.detail(id),
    queryFn: () => api.companies.get(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.companies.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.companies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.companies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}
