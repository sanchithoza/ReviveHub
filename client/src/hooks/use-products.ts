import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryKey = {
  all: ["products"] as const,
  details: () => [...queryKey.all, "detail"] as const,
  detail: (id: number) => [...queryKey.details(), id] as const,
};

export function useProductsList() {
  return useQuery<any[]>({
    queryKey: queryKey.all,
    queryFn: api.products.list,
    placeholderData: [],
  });
}

export function useProductDetails(id: number) {
  return useQuery<any>({
    queryKey: queryKey.detail(id),
    queryFn: () => api.products.get(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}
