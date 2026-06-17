import { useMutation } from "@tanstack/react-query";
import { getCareerInsights } from "../services/api";

/**
 * Hook to generate career insights from resume text.
 */
export function useCareerInsights() {
  return useMutation({
    mutationFn: ({ resumeText, targetRole, targetIndustry }) =>
      getCareerInsights(resumeText, targetRole, targetIndustry),
  });
}