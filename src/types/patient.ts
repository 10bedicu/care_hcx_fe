export type Patient = {
  id: string;
  name: string;
  date_of_birth?: string;
  year_of_birth?: number;
  gender: string;

  [key: string]: unknown;
};
