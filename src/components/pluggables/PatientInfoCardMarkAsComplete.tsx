import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import { FC, useMemo } from "react";

import { ClaimUse } from "@/types/claim";
import { Encounter } from "@/types/encounter";
import { apis } from "@/apis";
import { useQuery } from "@tanstack/react-query";

type PatientInfoCardMarkAsCompleteProps = {
  encounter: Encounter;
};

const PatientInfoCardMarkAsComplete: FC<PatientInfoCardMarkAsCompleteProps> = ({
  encounter,
}) => {
  const { data: claims } = useQuery({
    queryKey: ["claims", encounter.id],
    queryFn: () =>
      apis.claim.list({
        encounter: encounter.id,
        ordering: "-created_date",
      }),
    enabled: !!encounter.id,
  });

  const stats = useMemo(
    () =>
      claims?.results.reduce(
        (acc, claim) => {
          acc[claim.use]++;
          return acc;
        },
        {
          preauthorization: 0,
          claim: 0,
          predetermination: 0,
        } as Record<ClaimUse, number>
      ),
    [claims]
  );

  if (stats?.claim) {
    return null;
  }

  return (
    <div className="hcx-container">
      <Alert variant="warning">
        <ChevronRightIcon className="h-4 w-4" />
        <AlertTitle className="font-medium text-base">
          You haven't made a claim for this encounter yet.
        </AlertTitle>
        <AlertDescription>
          {!!stats?.preauthorization && !stats?.claim && (
            <>
              <span>
                You have made a pre-authorization check for this encounter, but
                you haven't made a claim yet.
              </span>
              <br />
            </>
          )}
          To make an insurance claim, Please go to the{" "}
          <a
            href={`/facility/${encounter.facility.id}/encounter/${encounter.id}/claims`}
            className="text-blue-500 underline inline-flex gap-0.5"
          >
            Claims Tab <ExternalLinkIcon className="h-2.5 w-2.5 inline" />
          </a>{" "}
          and raise a claim.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PatientInfoCardMarkAsComplete;
