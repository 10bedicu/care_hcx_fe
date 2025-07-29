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
} from "@/components/ui/card";
import { Claim, getClaimApprovalStatus } from "@/types/claim";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FC, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/lib/constants";
import { apis } from "@/apis";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

type ClaimCardProps = {
  claim: Claim;
};

export const ClaimCard: FC<ClaimCardProps> = ({ claim: _claim }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const [isOpen, setIsOpen] = useState(false);

  const { data: claim } = useQuery({
    queryKey: ["claim", _claim.id],
    queryFn: () => apis.claim.get(_claim.id),
    enabled: !!_claim.id && isOpen,
  });

  const status = useMemo(() => getClaimApprovalStatus(_claim), [_claim]);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-col gap-3 bg-gray-50 border-t rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="capitalize">{_claim.use}</CardTitle>
              <CardDescription>
                {t("claim_id")}: #{_claim.id}
              </CardDescription>
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
              {
                (_claim.latest_claim_response?.total_amount ??
                  _claim.total) as number
              }
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="max-sm:-mx-6 mt-8 flow-root">
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
                      {claim?.latest_claim_response?.total_amount
                        ? formatCurrency(
                            claim?.latest_claim_response?.total_amount as number
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
                {t("created_on")}: {formatDate(_claim.created_date!)}
              </span>
            </div>
            {status !== "pending" && (
              <div className="flex items-center gap-1.5">
                {status === "approved" && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                )}
                {status === "rejected" && (
                  <XCircleIcon className="w-4 h-4 text-red-500" />
                )}
                <span className="capitalize">
                  {status} On:{" "}
                  {formatDate(_claim.latest_claim_response?.created_date)}
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
              <span className="sr-only">{t("toggle_details")}</span>
            </Button>
          </CollapsibleTrigger>
        </CardFooter>
      </Collapsible>
    </Card>
  );
};
