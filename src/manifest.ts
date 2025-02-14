import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_hcx",
  routes,
  extends: [],
  components: {},
  navItems: [],
  encounterTabs: {
    claims: lazy(() => import("./components/encounter-tabs/Claims")),
  },
};

export default manifest;
