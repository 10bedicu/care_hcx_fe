import { Coverage, CoverageEligibilityRequest } from "@/types/coverage";
import {
  CreateFileRequest,
  CreateFileResponse,
  FileUploadModel,
} from "@/types/file_uploaad";
import { queryString, request } from "./request";

import { Claim } from "@/types/claim";
import { PaginatedResponse } from "./types";

export const apis = {
  coverage: {
    list: async (query?: {
      beneficiary?: string;
      ordering?:
        | "created_date"
        | "-created_date"
        | "modified_date"
        | "-modified_date";
    }) => {
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
    list: async (query?: {
      encounter?: string;
      ordering?:
        | "created_date"
        | "-created_date"
        | "modified_date"
        | "-modified_date";
    }) => {
      return await request<PaginatedResponse<Claim>>(
        "/api/hcx/claim/" + queryString(query)
      );
    },

    get: async (id: string) => {
      return await request<Claim>(`/api/hcx/claim/${id}/`);
    },

    create: async (body: {
      type: string;
      status: string;
      use: string;
      priority: string;
      encounter: string;
      insurance: [
        {
          sequence: 1;
          focal: true;
          coverage: string;
        }
      ];
      item: {
        sequence: number;
        category: {
          code: string;
          system: string;
          display: string;
        };
        product_or_service: {
          system: string;
          code: string;
          display: string;
        };
        quantity: number;
        unit_price: number;
      }[];
      supporting_info: {
        sequence: number;
        category?: {
          code: string;
          system: string;
          display: string;
        };
        value?: string;
        attachment?: string;
      }[];
    }) => {
      return await request<Claim>("/api/hcx/claim/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    submit: async (id: string) => {
      return await request<Claim>(`/api/hcx/claim/${id}/submit/`, {
        method: "POST",
      });
    },
  },

  file: {
    createUpload: async (body: CreateFileRequest) => {
      return await request<CreateFileResponse>("/api/v1/files/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    markUploadCompleted: async (id: string) => {
      return await request<FileUploadModel>(
        `/api/v1/files/${id}/mark_upload_completed/`,
        {
          method: "POST",
        }
      );
    },
  },
};
