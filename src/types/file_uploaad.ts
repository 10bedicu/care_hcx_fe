import { User } from "./user";

export type FileUpload = {
  file_type: "patient" | "encounter";
  file_category: FileCategory;
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

export type FileCategory =
  | "unspecified"
  | "xray"
  | "audio"
  | "identity_proof"
  | "discharge_summary";

export interface CreateFileRequest {
  file_type: string | number;
  file_category: FileCategory;
  name: string;
  associating_id: string;
  original_name: string;
  mime_type: string;
}

export interface CreateFileResponse {
  id: string;
  file_type: string;
  file_category: FileCategory;
  signed_url: string;
  internal_name: string;
}

export interface FileUploadModel {
  id?: string;
  name?: string;
  associating_id?: string;
  created_date?: string;
  upload_completed?: boolean;
  uploaded_by?: User;
  file_category?: FileCategory;
  read_signed_url?: string;
  is_archived?: boolean;
  archive_reason?: string;
  extension?: string;
  archived_by?: User;
  archived_datetime?: string;
}

