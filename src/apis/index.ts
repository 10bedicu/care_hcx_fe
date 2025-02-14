import { Coverage, CoverageEligibilityRequest } from "@/types/coverage";
import { queryString, request } from "./request";

import { Claim } from "@/types/claim";
import { PaginatedResponse } from "./types";

export const apis = {
  coverage: {
    list: async (query?: { beneficiary?: string }) => {
      return await request<PaginatedResponse<Coverage>>(
        "/api/hcx/coverage/" + queryString(query)
      );
    },

    create: async (body: {
      beneficiary: string;
      identifier: string;
      subscriber_id: string;
      payor: {
        identifier: string;
        name: string;
      };
      status: string;
      kind: string;
    }) => {
      return await request<Coverage>("/api/hcx/coverage/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    get: async (id: string) => {
      return await request<Coverage>(`/api/hcx/coverage/${id}/`);
    },

    checkEligibility: async (
      id: string,
      body: {
        facility: string;
        priority: string;
        purpose: string;
      }
    ) => {
      return await request<CoverageEligibilityRequest>(
        `/api/hcx/coverage/${id}/check_eligibility/`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
    },

    payors: async (query: string) => {
      return await request<{ name: string; code: string }[]>(
        `/api/hcx/coverage/payors/` + queryString({ query })
      );
    },

    delete: async (id: string) => {
      return await request<{}>(`/api/hcx/coverage/${id}/`, {
        method: "DELETE",
      });
    },
  },

  claim: {
    list: async (query?: { encounter?: string }) => {
      return await request<PaginatedResponse<Claim>>(
        "/api/hcx/claim/" + queryString(query)
      );
    },

    get: async (id: string) => {
      return await request<Claim>(`/api/hcx/claim/${id}/`);
    },
  },
};
