import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, updateJob, updateJobStatus, deleteJob } from "../services/api";

export function useGetJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await getJobs();
      return res.data;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateJobStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });
}