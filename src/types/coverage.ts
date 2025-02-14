import { User } from "./user";

export type Coverage = {
  id: string;
  identifier: string;
  subscriber_id: string;
  payor: {
    identifier: string;
    name: string;
  };

  created_date: string;
  modified_date: string;
  created_by: User;
  updated_by: User;
};

export type CoverageEligibilityRequest = {};

export type CoverageEligibilityResponse = {};
