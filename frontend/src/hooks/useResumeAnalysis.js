import { useMutation } from "@tanstack/react-query";
import { uploadResume, matchResume } from "../services/api";

/**
 * Custom hook that orchestrates the full resume analysis flow:
 * 1. Upload PDF → extract text
 * 2. Match text against job description
 *
 * Usage:
 *   const { analyze, result, isLoading, error } = useResumeAnalysis();
 *   await analyze(file, jobDescription);
 */
export function useResumeAnalysis() {
  const uploadMutation = useMutation({
    mutationFn: uploadResume,
  });

  const matchMutation = useMutation({
    mutationFn: matchResume,
  });

  const analyze = async (file, jobDescription) => {
    // Step 1 — upload & parse PDF
    const uploadRes = await uploadMutation.mutateAsync(file);
    const resumeText = uploadRes.data.text;

    // Step 2 — match against JD
    const matchRes = await matchMutation.mutateAsync(resumeText, jobDescription);
    return matchRes.data;
  };

  const isLoading = uploadMutation.isPending || matchMutation.isPending;
  const error = uploadMutation.error || matchMutation.error;

  return {
    analyze,
    isLoading,
    error,
  };
}