import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateCoverLetterAI,
  getCoverLetters,
  getCoverLetterById,
  deleteCoverLetter,
} from "../services/api";

/**
 * Hook to generate a cover letter with AI.
 */
export function useGenerateCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeText, jobDescription, tone, resumeId }) =>
      generateCoverLetterAI(resumeText, jobDescription, tone, resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverLetters"] });
    },
  });
}

/**
 * Hook to get all cover letters.
 */
export function useGetCoverLetters() {
  return useQuery({
    queryKey: ["coverLetters"],
    queryFn: async () => {
      const res = await getCoverLetters();
      return res.data;
    },
  });
}

/**
 * Hook to get a single cover letter by ID.
 */
export function useGetCoverLetter(id) {
  return useQuery({
    queryKey: ["coverLetters", id],
    queryFn: async () => {
      const res = await getCoverLetterById(id);
      return res.data.coverLetter;
    },
    enabled: !!id,
  });
}

/**
 * Hook to delete a cover letter.
 */
export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverLetters"] });
    },
  });
}