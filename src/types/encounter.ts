import { Patient } from "./patient";

export type Encounter = {
  id: string;
  patient: Patient;

  [key: string]: unknown;
};
