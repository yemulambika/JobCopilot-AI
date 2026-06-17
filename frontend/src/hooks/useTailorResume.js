import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  tailorResume,
  getTailoredResumes,
  getTailoredResumeById,
  deleteTailoredResume,
} from "../services/api";

/**
 * Hook to tailor a resume to a job description using Gemini AI.
 */
export function useTailorResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ masterResumeText, jobDescription, resumeId }) =>
      tailorResume(masterResumeText, jobDescription, resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tailoredResumes"] });
    },
  });
}

/**
 * Hook to get all tailored resumes.
 */
export function useGetTailoredResumes() {
  return useQuery({
    queryKey: ["tailoredResumes"],
    queryFn: async () => {
      const res = await getTailoredResumes();
      return res.data;
    },
  });
}

/**
 * Hook to get a single tailored resume by ID.
 */
export function useGetTailoredResume(id) {
  return useQuery({
    queryKey: ["tailoredResumes", id],
    queryFn: async () => {
      const res = await getTailoredResumeById(id);
      return res.data.tailored;
    },
    enabled: !!id,
  });
}

/**
 * Hook to delete a tailored resume.
 */
export function useDeleteTailoredResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTailoredResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tailoredResumes"] });
    },
  });
}