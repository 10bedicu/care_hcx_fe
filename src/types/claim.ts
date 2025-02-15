import { Coding, HcxError, Period } from "./base";

import { Condition } from "./condition";
import { Coverage } from "./coverage";
import { FileUpload } from "./file_uploaad";
import { User } from "./user";

export const CLAIM_TYPES = [
  "institutional",
  "oral",
  "pharmacy",
  "professional",
  "vision",
] as const;
export type ClaimType = (typeof CLAIM_TYPES)[number];

export const CLAIM_USES = [
  "claim",
  "preauthorization",
  "predetermination",
] as const;
export type ClaimUse = (typeof CLAIM_USES)[number];

export const CLAIM_STATUSES = [
  "active",
  "cancelled",
  "draft",
  "entered-in-error",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_PRIORITIES = ["stat", "normal", "deferred"] as const;
export type ClaimPriorityCode = (typeof CLAIM_PRIORITIES)[number];

export const CLAIM_RELATED_RELATIONSHIPS = [
  "enhancement",
  "settlement",
  "prior",
  "associated",
] as const;
export type ClaimRelatedRelationshipChoice =
  (typeof CLAIM_RELATED_RELATIONSHIPS)[number];

export type ClaimInsurance = {
  sequence: number;
  focal?: boolean;
  coverage: Coverage;
};

export type ClaimRelated = {
  claim: Claim;
  relationship: ClaimRelatedRelationshipChoice;
};

export type ClaimCareTeam = {
  sequence: number;
  provider: User;
  responsible?: boolean;
};

export type ClaimDiagnosis = {
  sequence: number;
  diagnosis: Condition;
};

export type ClaimProcedure = {
  sequence: number;
  procedure: unknown;
  date?: string;
};

export type ClaimSupportingInfo = {
  sequence: number;
  category: Coding;
  value?: string;
  attachment?: FileUpload;
};

export type ClaimItem = {
  sequence: number;
  care_team_sequence: number[];
  diagnosis_sequence: number[];
  procedure_sequence: number[];
  information_sequence: number[];
  category?: Coding;
  product_or_service: Coding;
  quantity: number;
  unit_price: number;
  patient_paid?: number;
  tax?: number;
  net?: number;
};

export type Claim = {
  id: string;
  type: ClaimType;
  use: ClaimUse;
  status: ClaimStatus;
  priority: ClaimPriorityCode;
  encounter: string;
  insurance: ClaimInsurance[];
  related?: ClaimRelated[];
  care_team?: ClaimCareTeam[];
  diagnosis?: ClaimDiagnosis[];
  procedure?: ClaimProcedure[];
  supporting_info?: ClaimSupportingInfo[];
  item?: ClaimItem[];
  billable_period?: Period;
  patient_paid?: number;
  total?: number;

  latest_claim_response?: ClaimResponse;

  created_date?: string;
  modified_date?: string;
  created_by?: User;
  updated_by?: User;

  latest_response?: Record<string, unknown>;
};

export const CLAIM_RESPONSE_OUTCOME = [
  "complete",
  "error",
  "partial",
  "queued",
] as const;
export type CoverageEligibilityResponseOutcome =
  (typeof CLAIM_RESPONSE_OUTCOME)[number];

export type ClaimResponse = {
  id: string;
  request: Claim;
  outcome: CoverageEligibilityResponseOutcome;
  disposition?: string;
  error?: HcxError;
  total_amount?: number;

  created_date: string;
  modified_date: string;
};

export const getClaimApprovalStatus = (claim?: Claim) => {
  if (!claim) return "pending";

  if (
    claim.latest_claim_response?.outcome === "error" ||
    claim.latest_claim_response?.error
  ) {
    return "rejected";
  }

  if (claim.latest_claim_response?.outcome === "complete") {
    return "approved";
  }

  return "pending";
};
