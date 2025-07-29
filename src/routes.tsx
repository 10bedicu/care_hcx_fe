import ClaimsPage from "@/components/claims-page/ClaimsPage";

const routes = {
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/claims/:coverageEligibilityRequestId":
    ({
      facilityId,
      patientId,
      encounterId,
      coverageEligibilityRequestId,
    }: {
      facilityId: string;
      patientId: string;
      encounterId: string;
      coverageEligibilityRequestId: string;
    }) => (
      <ClaimsPage
        facilityId={facilityId}
        patientId={patientId}
        encounterId={encounterId}
        coverageEligibilityRequestId={coverageEligibilityRequestId}
      />
    ),
};

export default routes;
