import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryKey = {
  all: ["returns"] as const,
  details: () => [...queryKey.all, "detail"] as const,
  detail: (id: number) => [...queryKey.details(), id] as const,
};

export function useReturnsList() {
  return useQuery<any[]>({
    queryKey: queryKey.all,
    queryFn: api.returns.list,
    placeholderData: [],
  });
}

export function useReturnDetails(id: number) {
  return useQuery<any>({
    queryKey: queryKey.detail(id),
    queryFn: () => api.returns.get(id),
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.returns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useSendReturnToCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.returns.sendToCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useReceiveReturnFromCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { new_serial_number?: string } }) =>
      api.returns.receiveFromCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useCompleteReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.returns.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}
