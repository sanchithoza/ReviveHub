import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const queryKey = {
  all: ["users"] as const,
  details: () => [...queryKey.all, "detail"] as const,
  detail: (id: number) => [...queryKey.details(), id] as const,
};

export function useUsersList() {
  return useQuery<any[]>({
    queryKey: queryKey.all,
    queryFn: api.auth.listUsers,
    placeholderData: [],
  });
}

export function useUserDetails(id: number) {
  return useQuery<any>({
    queryKey: queryKey.detail(id),
    queryFn: () => api.auth.listUsers().then((users) => users.find((user: any) => user.id === id)),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.auth.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.auth.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}
