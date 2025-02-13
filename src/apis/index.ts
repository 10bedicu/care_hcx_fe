import { Coverage, CoverageEligibilityRequest } from "@/types/coverage";
import { queryString, request } from "./request";

import { PaginatedResponse } from "./types";

export const apis = {
  coverage: {
    list: async (query?: { beneficiary?: string }) => {
      return await request<PaginatedResponse<Coverage>>(
        "/api/hcx/coverage/" + queryString(query)
      );
    },

    create: async (body: Coverage) => {
      return await request<Coverage>("/api/hcx/coverage/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    get: async (id: string) => {
      return await request<Coverage>(`/api/hcx/coverage/${id}/`);
    },

    checkEligibility: async (id: string, body: CoverageEligibilityRequest) => {
      return await request<CoverageEligibilityRequest>(
        `/api/hcx/coverage/${id}/check_eligibility/`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
    },

    delete: async (id: string) => {
      return await request<{}>(`/api/hcx/coverage/${id}/`, {
        method: "DELETE",
      });
    },
  },

  claim: {},
};
