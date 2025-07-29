import { ChevronDown, User } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FC, useState } from "react";
import { calculateAge, formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimCard } from "./ClaimCard";
import { ClaimForm } from "./ClaimForm";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";

type ClaimsPageProps = {
  facilityId: string;
  patientId: string;
  encounterId: string;
  coverageEligibilityRequestId: string;
};

const ClaimsPage: FC<ClaimsPageProps> = ({
  encounterId,
  coverageEligibilityRequestId,
}) => {
  const [isSupportingInfoOpen, setIsSupportingInfoOpen] = useState(false);
  const [isCoverageDetailsOpen, setIsCoverageDetailsOpen] = useState(false);
  const [isPlanDetailsOpen, setIsPlanDetailsOpen] = useState(false);

  const { data: eligibilityRequest } = useQuery({
    queryKey: ["eligibilityRequest", coverageEligibilityRequestId],
    queryFn: () =>
      apis.coverageEligibilityRequest.get(coverageEligibilityRequestId),
    enabled: !!coverageEligibilityRequestId,
  });

  const { data: coverage } = useQuery({
    queryKey: ["coverage", eligibilityRequest?.coverage_id],
    queryFn: () => apis.coverage.get(eligibilityRequest?.coverage_id as string),
    enabled: !!eligibilityRequest?.coverage_id,
  });

  const { data: claims } = useQuery({
    queryKey: ["claims", encounterId],
    queryFn: () =>
      apis.claim.list({
        encounter: encounterId,
      }),
    enabled: !!encounterId,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900">
                    {coverage?.beneficiary?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {calculateAge(
                      coverage?.beneficiary?.date_of_birth,
                      coverage?.beneficiary?.year_of_birth
                    )}{" "}
                    <span className="capitalize">
                      {coverage?.beneficiary?.gender}
                    </span>
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500 truncate">
                        Coverage ID:
                      </span>
                      <span className="ml-1 font-medium">
                        {coverage?.identifier}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 truncate">
                        Subscriber ID:
                      </span>
                      <span className="ml-1 font-medium">
                        {coverage?.subscriber_id || "NA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 truncate">Payer ID:</span>
                      <span className="ml-1 font-medium">
                        {coverage?.payor?.name ||
                          coverage?.payor?.identifier ||
                          "NA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 truncate">Kind:</span>
                      <span className="ml-1 font-medium">
                        {coverage?.kind || "NA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 truncate">Purpose:</span>
                      <span className="ml-1 font-medium">
                        {eligibilityRequest?.purpose ?? "NA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 truncate">Priority:</span>
                      <span className="ml-1 font-medium">
                        {eligibilityRequest?.priority ?? "NA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Approved at {formatDate(eligibilityRequest?.created_date)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Policy Details
              </h3>
            </div>

            <div className="space-y-4">
              <Collapsible
                open={isSupportingInfoOpen}
                onOpenChange={setIsSupportingInfoOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <span className="text-left">
                      Supporting information required
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isSupportingInfoOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      Additional documentation may be required based on the
                      claim type and diagnosis.
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isCoverageDetailsOpen}
                onOpenChange={setIsCoverageDetailsOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <span className="text-left">Coverage Details</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isCoverageDetailsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="text-sm text-gray-600">
                    <p>Detailed coverage information and benefits breakdown.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isPlanDetailsOpen}
                onOpenChange={setIsPlanDetailsOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                  >
                    <span className="text-left">Plan Details</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isPlanDetailsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="text-sm text-gray-600">
                    <p>Comprehensive plan information and terms.</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="rounded-lg bg-white p-8">
              <ClaimForm encounterId={encounterId} coverage={coverage} />
            </div>

            <div className="flex w-full flex-col gap-8">
              <h3 className="text-2xl font-bold text-gray-900 mt-4">
                Previous Claims
              </h3>
              {claims?.results.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsPage;
