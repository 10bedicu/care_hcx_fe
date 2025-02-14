import { Encounter } from "@/types/encounter";
import { Patient } from "@/types/patient";

export type EncounterTabProps = {
  encounter: Encounter;
  patient: Patient;
  facilityId: string;
};
