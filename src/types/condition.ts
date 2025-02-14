import { Coding } from "./base";
import { Encounter } from "./encounter";
import { User } from "./user";

export type Condition = {
  clinical_status:
    | "active"
    | "resolved"
    | "inactive"
    | "recurrence"
    | "relapse"
    | "remission"
    | "unknown";
  verification_status:
    | "confirmed"
    | "unconfirmed"
    | "refuted"
    | "entered_in_error"
    | "provisional"
    | "differential";
  category: "problem_list_item" | "encounter_diagnosis" | "chronic_condition";
  severity: "mild" | "moderate" | "severe";
  code: Coding;
  encounter: Encounter;
  onset: {
    onset_datetime?: string;
    onset_age?: number;
    onset_string?: string;
    note?: string;
  };
  abatement: {
    abatement_datetime?: string;
    abatement_age?: number;
    abatement_string?: string;
    note?: string;
  };
  note?: string;

  created_by: User;
  updated_by: User;
};
