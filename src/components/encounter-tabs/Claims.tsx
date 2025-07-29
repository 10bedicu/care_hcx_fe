import CoverageEligibilityRequestCard from "./CoverageEligibilityRequestCard";
import { EncounterTabProps } from ".";
import { FC } from "react";
import PolicyCard from "./PolicyCard";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";

const ClaimsEncounterTab: FC<EncounterTabProps> = ({ encounter }) => {
  const { data: abhaNumber } = useQuery({
    queryKey: ["abhaNumber", encounter.patient.id],
    queryFn: () => apis.abhaNumber.get(encounter.patient?.id),
    enabled: !!encounter.patient?.id,
  });

  const { data: policies } = useQuery({
    queryKey: ["policies", abhaNumber?.abha_number],
    queryFn: () =>
      apis.gateway.getPolicies({
        identifiertype: "AbhaNumber",
        identifiervalue: abhaNumber?.abha_number?.replace(/-/g, "") ?? "",
      }),
    enabled: !!abhaNumber?.abha_number,
  });

  const { data: eligibilityRequests } = useQuery({
    queryKey: ["eligibilityRequests", encounter.patient.id],
    queryFn: () =>
      apis.coverageEligibilityRequest.list({
        patient: encounter.patient?.id,
      }),
    enabled: !!encounter.patient?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-12">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">
          Policy Details
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {policies?.map((policy) => (
            <PolicyCard key={policy.sno} policy={policy} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">
          Eligibility Requests
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {eligibilityRequests?.results?.map((request, index) => (
            <CoverageEligibilityRequestCard
              key={request.id}
              request={request}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaimsEncounterTab;
