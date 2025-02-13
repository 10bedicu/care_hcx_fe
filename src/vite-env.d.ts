/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import { Import } from "lucide-react";

interface ImportMetaEnv {}

declare global {
  var __CORE_ENV__: {
    readonly apiUrl: string;
  };
}
