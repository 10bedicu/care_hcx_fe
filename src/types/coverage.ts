import { HcxError, Period } from "./base";

import { Facility } from "./facility";
import { Patient } from "./patient";
import { User } from "./user";

export const COVERAGE_STATUSES = [
  "active",
  "cancelled",
  "draft",
  "entered-in-error",
] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export const COVERAGE_KINDS = ["insurance", "self_pay", "other"] as const;
export type CoverageKind = (typeof COVERAGE_KINDS)[number];

export const COVERAGE_RELATIONSHIP = [
  "child",
  "parent",
  "spouse",
  "common",
  "other",
  "self",
  "injured",
] as const;
export type CoverageRelationship = (typeof COVERAGE_RELATIONSHIP)[number];

export type CoveragePayor = {
  identifier: string;
  name: string;
};

export const COVERAGE_SUBSCRIBER_TYPE = ["related_person", "self"] as const;
export type CoverageSubscriberType = (typeof COVERAGE_SUBSCRIBER_TYPE)[number];

export type CoverageSubscriber = {
  type: CoverageSubscriberType;
  name?: string;
};

export const COVERAGE_POLICY_HOLDER_TYPE = [
  "organization",
  "related_person",
  "self",
] as const;
export type CoveragePolicyHolderType =
  (typeof COVERAGE_POLICY_HOLDER_TYPE)[number];

export type CoveragePolicyHolder = {
  type: CoveragePolicyHolderType;
  name?: string;
};

export type Coverage = {
  id: string;
  identifier: string;
  subscriber_id: string;
  period?: Period;
  policy_holder?: CoveragePolicyHolder;
  subscriber?: CoverageSubscriber;
  relationship?: CoverageRelationship;
  beneficiary: Patient;
  payor: CoveragePayor;
  status: CoverageStatus;
  kind: CoverageKind;

  latest_coverage_eligibility_request?: CoverageEligibilityRequest;
  latest_coverage_eligibility_response?: CoverageEligibilityResponse;

  created_date: string;
  modified_date: string;
  created_by: User;
  updated_by: User;
};

export const COVERAGE_ELIGIBILITY_REQUEST_PURPOSE = [
  "auth-requirements",
  "benefits",
  "discovery",
  "validation",
] as const;
export type CoverageEligibilityRequestPurpose =
  (typeof COVERAGE_ELIGIBILITY_REQUEST_PURPOSE)[number];

export const COVERAGE_ELIGIBILITY_REQUEST_PRIORITY = [
  "deferred",
  "normal",
  "stat",
] as const;
export type CoverageEligibilityRequestPriority =
  (typeof COVERAGE_ELIGIBILITY_REQUEST_PRIORITY)[number];

export type CoverageEligibilityRequest = {
  id: string;
  purpose: CoverageEligibilityRequestPurpose;
  priority: CoverageEligibilityRequestPriority;
  facility?: Facility;
  coverage_id: string;

  latest_coverage_eligibility_response?: CoverageEligibilityResponse;

  created_date: string;
  modified_date: string;
  created_by: User;
  updated_by: User;
};

export const COVERAGE_ELIGIBILITY_RESPONSE_OUTCOME = [
  "complete",
  "error",
  "partial",
  "queued",
] as const;
export type CoverageEligibilityResponseOutcome =
  (typeof COVERAGE_ELIGIBILITY_RESPONSE_OUTCOME)[number];

export type CoverageEligibilityResponse = {
  id: string;
  outcome: CoverageEligibilityResponseOutcome;
  request: CoverageEligibilityRequest;
  error?: HcxError;
  disposition?: string;

  created_date: string;
  modified_date: string;
};

export const getCoverageVerificationStatus = (
  coverage?: Coverage | CoverageEligibilityRequest
) => {
  if (!coverage) return "pending";

  if (
    coverage.latest_coverage_eligibility_response?.outcome === "error" ||
    coverage.latest_coverage_eligibility_response?.error
  ) {
    return "rejected";
  }

  if (coverage.latest_coverage_eligibility_response?.outcome === "complete") {
    return "verified";
  }

  return "pending";
};
