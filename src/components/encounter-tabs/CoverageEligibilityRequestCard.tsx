import { Card, CardContent } from "@/components/ui/card";
import {
  CoverageEligibilityRequest,
  getCoverageVerificationStatus,
} from "@/types/coverage";

import { Badge } from "../ui/badge";
import { Link } from "raviger";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { useMemo } from "react";

type CoverageEligibilityRequestCardProps = {
  request: CoverageEligibilityRequest;
  index?: number;
};

export default function CoverageEligibilityRequestCard({
  request,
  index,
}: CoverageEligibilityRequestCardProps) {
  const status = useMemo(
    () => getCoverageVerificationStatus(request),
    [request]
  );

  return (
    <Card className="w-full shadow-lg border border-gray-200 rounded-xl overflow-hidden py-0">
      <CardContent className="border-b border-gray-200 py-4 px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Request #{(index ?? 0) + 1}
            </h1>
            <p className="text-sm text-gray-600">
              {formatDistance(new Date(request.created_date), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("capitalize text-sm", {
                "bg-green-200 text-green-600": status === "verified",
                "bg-red-200 text-red-600": status === "rejected",
                "bg-yellow-200 text-yellow-600": status === "pending",
              })}
            >
              {status}
            </Badge>
            {status === "verified" && (
              <Link href={`${window.location.pathname}/${request.id}`}>
                <SquareArrowOutUpRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
