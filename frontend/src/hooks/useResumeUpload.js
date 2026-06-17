import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadResume, getResumes, getResumeById, deleteResume } from "../services/api";

/**
 * Hook to upload a resume file (PDF or DOCX).
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      // Invalidate resume list to refresh
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

/**
 * Hook to get all resumes for the current user.
 */
export function useGetResumes() {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await getResumes();
      return res.data;
    },
  });
}

/**
 * Hook to get a single resume by ID.
 */
export function useGetResumeById(id) {
  return useQuery({
    queryKey: ["resumes", id],
    queryFn: async () => {
      const res = await getResumeById(id);
      return res.data.resume;
    },
    enabled: !!id,
  });
}

/**
 * Hook to delete a resume.
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}