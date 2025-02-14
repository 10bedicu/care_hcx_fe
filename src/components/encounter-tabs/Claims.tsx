import {
  AlarmClockMinusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  IndianRupeeIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { FC, useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Claim } from "@/types/claim";
import { Encounter } from "@/types/encounter";
import { EncounterTabProps } from ".";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
import { formatDate } from "date-fns";
import { useMessageListener } from "@/hooks/use-message-listener";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const ClaimsEncounterTab: FC<EncounterTabProps> = ({ encounter }) => {
  //   const { t } = useTranslation(I18NNAMESPACE);

  const { data: claims, refetch: refetchClaims } = useQuery({
    queryKey: ["claims", encounter.id],
    queryFn: () =>
      apis.claim.list({
        encounter: encounter.id,
      }),
    enabled: !!encounter.id,
  });

  useMessageListener((data) => {
    if (
      data.type === "MESSAGE" &&
      (data.from === "claim/on_submit" || data.from === "preauth/on_submit") &&
      data.message === "success"
    ) {
      refetchClaims();
    }
  });

  return (
    <div className="relative flex flex-col pb-2">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-16">
        <div className="rounded-lg bg-white p-8">
          <CreateClaimCard encounter={encounter} />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {claims?.results.map((claim) => (
            <ClaimCard claim={claim} />
          ))}
        </div>
      </div>
    </div>
  );
};

type CreateClaimCardProps = {
  encounter: Encounter;
};

const CreateClaimCard: FC<CreateClaimCardProps> = ({ encounter }) => {
  return <div>{encounter.id}</div>;
};

type ClaimCardProps = {
  claim: Claim;
};

const ClaimCard: FC<ClaimCardProps> = ({ claim: _claim }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const [isOpen, setIsOpen] = useState(false);

  const { data: claim } = useQuery({
    queryKey: ["claim", _claim.id],
    queryFn: () => apis.claim.get(_claim.id),
    enabled: !!_claim.id && isOpen,
  });

  const status = useMemo(() => {
    if (!_claim.latest_response) return "pending";

    if (_claim.latest_response.outcome === "complete") return "approved";
    if (_claim.latest_response.outcome === "error") return "rejected";

    return "pending";
  }, [_claim]);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-col gap-3 bg-gray-50 border-t rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="capitalize">{_claim.use}</CardTitle>
              <CardDescription>Claim ID: #{_claim.id}</CardDescription>
            </div>
            <Badge
              className={cn("capitalize text-xs", {
                "bg-green-200 text-green-600": _claim.priority === "stat",
                "bg-yellow-200 text-yellow-600": _claim.priority === "normal",
                "bg-red-200 text-red-600": _claim.priority === "deferred",
              })}
            >
              {_claim.priority}
            </Badge>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {status === "approved" && (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              )}
              {status === "rejected" && (
                <XCircleIcon className="w-4 h-4 text-red-500" />
              )}
              {status === "pending" && (
                <AlarmClockMinusIcon className="w-4 h-4 text-yellow-500" />
              )}
              <span
                className={cn("capitalize font-medium text-sm", {
                  "text-green-500": status === "approved",
                  "text-red-500": status === "rejected",
                  "text-yellow-500": status === "pending",
                })}
              >
                {status}
              </span>
            </div>
            <div className="flex items-center text-2xl font-bold">
              <IndianRupeeIcon className="w-6 h-6 text-gray-500 mr-1" />
              {(_claim.latest_response?.total ?? _claim.total) as number}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="-mx-6 mt-8 flow-root sm:mx-0">
              <table className="min-w-full divide-y divide-secondary-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-secondary-900 sm:pl-0"
                    >
                      {t("claim__items")}
                    </th>
                    <th></th>
                    <th></th>
                    <th
                      scope="col"
                      className="py-3.5 pl-3 pr-6 text-right text-sm font-semibold text-secondary-900 sm:pr-0"
                    >
                      {t("claim__item__price")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claim?.item?.map((item) => (
                    <tr
                      key={item.sequence}
                      className="border-b border-secondary-200"
                    >
                      <td className="py-4 pl-6 pr-3 text-sm sm:pl-0">
                        <div className="font-medium text-secondary-900">
                          {item.product_or_service.code}
                        </div>
                        <div className="mt-0.5 text-secondary-500">
                          {item.product_or_service.display}
                        </div>
                      </td>
                      <td></td>
                      <td></td>
                      <td className="py-4 pl-3 pr-6 text-right text-sm text-secondary-500 sm:pr-0">
                        {formatCurrency(item.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="table-cell pl-6 pr-3 pt-6 text-right text-sm font-normal text-secondary-500 sm:pl-0"
                    >
                      {t("claim__total_claim_amount")}
                    </th>
                    <td className="pl-3 pr-6 pt-6 text-right text-sm text-secondary-500 sm:pr-0">
                      {claim?.total && formatCurrency(claim?.total)}
                    </td>
                  </tr>

                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="table-cell pl-6 pr-3 pt-4 text-right text-sm font-semibold text-secondary-900 sm:pl-0"
                    >
                      {t("claim__total_approved_amount")}
                    </th>
                    <td className="pl-3 pr-6 pt-4 text-right text-sm font-semibold text-secondary-900 sm:pr-0">
                      {claim?.latest_response?.total
                        ? formatCurrency(
                            claim?.latest_response?.total as number
                          )
                        : "NA"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
        <CardFooter
          className={cn("flex justify-between p-4 pt-4", isOpen && "border-t")}
        >
          <div className="flex space-x-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              <span>
                Created On: {formatDate(_claim.created_date!, "dd MMM yyyy")}
              </span>
            </div>
            {status !== "pending" && (
              <div className="flex items-center">
                {status === "approved" && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
                {status === "rejected" && (
                  <XCircleIcon className="w-4 h-4 text-red-500" />
                )}
                <span className="capitalize">
                  {status} On: {_claim.latest_response?.created_at as string}
                </span>
              </div>
            )}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle details</span>
            </Button>
          </CollapsibleTrigger>
        </CardFooter>
      </Collapsible>
    </Card>
  );
};

export default ClaimsEncounterTab;
