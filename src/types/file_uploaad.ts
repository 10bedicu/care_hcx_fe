import { User } from "./user";

export type FileUpload = {
  file_type: "patient" | "encounter";
  file_category:
    | "audio"
    | "xray"
    | "identity_proof"
    | "unspecified"
    | "discharge_summary";
  associating_id: string;
  archived_by?: User;
  archived_datetime?: string;
  upload_completed: boolean;
  is_archived?: boolean;
  archive_reason?: string;
  created_date: string;
  extension: string;
  uploaded_by: User;
  signed_url?: string;
  read_signed_url?: string;
  internal_name: string;
};
