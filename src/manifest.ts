import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_hcx",
  routes,
  extends: [],
  components: {
    PatientInfoCardMarkAsComplete: lazy(
      () => import("./components/pluggables/PatientInfoCardMarkAsComplete")
    ),
  },
  navItems: [],
  encounterTabs: {
    claims: lazy(() => import("./components/encounter-tabs/Claims")),
  },
};

export default manifest;
