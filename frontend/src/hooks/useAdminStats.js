import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../services/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await getAdminDashboard();
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}