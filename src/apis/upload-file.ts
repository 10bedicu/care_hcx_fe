import { Dispatch, SetStateAction } from "react";

import { t } from "i18next";
import { toast } from "sonner";

export function handleUploadPercentage(
  event: ProgressEvent,
  setUploadPercent: Dispatch<SetStateAction<number>>
) {
  if (event.lengthComputable) {
    const percentComplete = Math.round((event.loaded / event.total) * 100);
    setUploadPercent(percentComplete);
  }
}

const uploadFile = async (
  url: string,
  file: File | FormData,
  reqMethod: string,
  headers: object,
  onLoad: (xhr: XMLHttpRequest) => void,
  setUploadPercent: Dispatch<SetStateAction<number>> | null,
  onError: () => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(reqMethod, url);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      onLoad(xhr);
      if (400 <= xhr.status && xhr.status <= 499) {
        let error;
        try {
          error = JSON.parse(xhr.responseText);
        } catch {
          error = xhr.responseText;
        }
        toast.error(error.errors);
        reject(new Error("Client error"));
        reject(new Error("Client error"));
      } else {
        resolve();
      }
    };

    if (setUploadPercent != null) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        handleUploadPercentage(event, setUploadPercent);
      };
    }

    xhr.onerror = () => {
      toast.error(t("network_failure"));
      onError();
      reject(new Error("Network error"));
    };

    xhr.send(file);
  });
};
export default uploadFile;
