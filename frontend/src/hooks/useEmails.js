import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateEmailAI,
  getEmails,
  getEmailById,
  deleteEmail,
} from "../services/api";

export function useGenerateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateEmailAI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}

export function useGetEmails() {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const res = await getEmails();
      return res.data;
    },
  });
}

export function useGetEmail(id) {
  return useQuery({
    queryKey: ["emails", id],
    queryFn: async () => {
      const res = await getEmailById(id);
      return res.data.email;
    },
    enabled: !!id,
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
}