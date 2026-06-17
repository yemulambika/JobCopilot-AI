import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getResumeVersions,
  getResumeVersionById,
  createResumeVersion,
  restoreResumeVersion,
  compareResumeVersions,
  downloadResumeVersion,
  deleteResumeVersion,
} from "../services/api";

/**
 * Hook to get all resume versions.
 * @param {string} [masterResumeId] — optional filter
 */
export function useResumeVersions(masterResumeId) {
  return useQuery({
    queryKey: ["resumeVersions", masterResumeId],
    queryFn: async () => {
      const res = await getResumeVersions(masterResumeId);
      return res.data;
    },
  });
}

/**
 * Hook to get a single version with full content.
 */
export function useResumeVersion(id) {
  return useQuery({
    queryKey: ["resumeVersion", id],
    queryFn: async () => {
      const res = await getResumeVersionById(id);
      return res.data.version;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new resume version.
 */
export function useCreateResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResumeVersion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resumeVersions"] });
    },
  });
}

/**
 * Hook to restore a version as active.
 */
export function useRestoreResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreResumeVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumeVersions"] });
    },
  });
}

/**
 * Hook to compare two versions.
 */
export function useCompareResumeVersions() {
  return useMutation({
    mutationFn: ({ versionA, versionB }) => compareResumeVersions(versionA, versionB),
  });
}

/**
 * Hook to download a version as a text file.
 */
export function useDownloadResumeVersion() {
  return useMutation({
    mutationFn: async (id) => {
      const res = await downloadResumeVersion(id);
      // Trigger browser download
      const blob = new Blob([res.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_version_${id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    },
  });
}

/**
 * Hook to delete a resume version.
 */
export function useDeleteResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteResumeVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumeVersions"] });
    },
  });
}