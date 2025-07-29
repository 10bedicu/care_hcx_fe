import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Policy } from "@/types/policy";

type PolicyCardProps = {
  policy: Policy;
};

export default function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <Card className="w-full shadow-lg border border-gray-200 rounded-xl overflow-hidden py-0">
      <CardHeader className="bg-gray-100 border-b border-gray-200 pb-3 pt-6 px-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {policy.productid}
            </h1>
            <p className="text-sm text-gray-600">Policy ID</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-white space-y-6 p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1 truncate">
              {policy.memberid}
            </p>
            <p className="text-xs text-gray-600">Member ID</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1 truncate">
              {policy.mobilenumber}
            </p>
            <p className="text-xs text-gray-600">Mobile Number</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1 truncate">
              {policy.payerid}
            </p>
            <p className="text-xs text-gray-600">Payer ID</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1 truncate">
              {policy.productname}
            </p>
            <p className="text-xs text-gray-600">Policy Name</p>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-medium border-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-700 hover:border-green-600 bg-transparent rounded-lg"
          >
            Check Eligibility
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
