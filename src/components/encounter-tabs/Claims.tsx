import {
  AlarmClockMinusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleMinusIcon,
  FileIcon,
  IndianRupeeIcon,
  Loader2Icon,
  PaperclipIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { CLAIM_ITEM_CATEGORIES, I18NNAMESPACE } from "@/lib/constants";
import {
  CLAIM_PRIORITIES,
  CLAIM_USES,
  Claim,
  getClaimApprovalStatus,
} from "@/types/claim";
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
import { Coverage, getCoverageVerificationStatus } from "@/types/coverage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FC, useEffect, useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatCurrency, formatDate, toast } from "@/lib/utils";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Autocomplete from "../ui/autocomplete";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Description } from "@radix-ui/react-dialog";
import { Encounter } from "@/types/encounter";
import { EncounterTabProps } from ".";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { apis } from "@/apis";
import useFileUpload from "@/hooks/use-file-upload";
import { useMessageListener } from "@/hooks/use-message-listener";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const ClaimsEncounterTab: FC<EncounterTabProps> = ({ encounter }) => {
  const { data: claims, refetch: refetchClaims } = useQuery({
    queryKey: ["claims", encounter.id],
    queryFn: () =>
      apis.claim.list({
        encounter: encounter.id,
        ordering: "-created_date",
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
  const [coverage, setCoverage] = useState<string>();

  const { data: coverages } = useQuery({
    queryKey: ["coverages", encounter.patient.id],
    queryFn: () =>
      apis.coverage.list({
        beneficiary: encounter.patient.id,
        ordering: "-created_date",
      }),
    enabled: !!encounter.patient.id,
  }); // TODO: implement searching

  const selectedCoverage = useMemo(() => {
    return coverages?.results.find((_coverage) => _coverage.id === coverage);
  }, [coverage]);

  const status = useMemo(
    () => getCoverageVerificationStatus(selectedCoverage),
    [selectedCoverage]
  );

  const {
    mutate: checkCoverageEligibility,
    isPending: checkCoverageEligibilityIsPending,
  } = useMutation({
    mutationFn: () =>
      apis.coverage.checkEligibility(selectedCoverage?.id!, {
        facility: encounter.facility.id,
        priority: "normal",
        purpose: "validation",
      }),
    onSuccess: () => {
      setCoverage(undefined);
      toast.success("Coverage eligibility check initiated successfully");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col gap-4 justify-between items-center">
        <h2 className="mb-2">Check Coverage Eligibility</h2>
        <ManageCoverages patientId={encounter.patient.id} />
      </div>
      <div className="flex sm:flex-row flex-col gap-4 justify-between items-center">
        <Autocomplete
          options={
            coverages?.results.map((coverage) => {
              const status = getCoverageVerificationStatus(coverage);

              return {
                label: `${coverage.subscriber_id} - ${coverage.identifier}`,
                display: (
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-gray-500">
                          {coverage.subscriber_id} -{" "}
                        </span>
                        <span className="font-medium">
                          {coverage.identifier}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {coverage.payor.name}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          - {coverage.payor.identifier}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Badge
                        className={cn("capitalize text-xs", {
                          "bg-green-200 text-green-600": status === "verified",
                          "bg-red-200 text-red-600": status === "rejected",
                          "bg-yellow-200 text-yellow-600": status === "pending",
                        })}
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                ),
                value: coverage.id,
              };
            }) ?? []
          }
          value={coverage}
          onChange={setCoverage}
        />
        <Button
          type="button"
          disabled={!(selectedCoverage && status === "pending")}
          loading={checkCoverageEligibilityIsPending}
          onClick={() => {
            checkCoverageEligibility();
          }}
        >
          Check Eligibility
        </Button>
      </div>

      {status === "verified" && (
        <div>
          <ClaimForm encounter={encounter} coverage={selectedCoverage} />
        </div>
      )}
    </div>
  );
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

  const status = useMemo(() => getClaimApprovalStatus(_claim), [_claim]);

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
              <span>Created On: {formatDate(_claim.created_date!)}</span>
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
                  {formatDate(_claim.latest_claim_response?.created_date!)}
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

type ManageCoveragesProps = {
  patientId: string;
};

const coverageFormSchema = z.object({
  identifier: z.string().min(2, {
    message: "Coverage Id must be at least 2 characters.",
  }),
  subscriber_id: z.string().min(2, {
    message: "Subscriber Id must be at least 2 characters.",
  }),
  payor_identifier: z.string().min(2, {
    message: "Payor Id must be at least 2 characters.",
  }),
  payor_name: z.string().min(2, {
    message: "Payor Name must be at least 2 characters.",
  }),
  payor_search_text: z.string().optional(),
});

const ManageCoverages: FC<ManageCoveragesProps> = ({ patientId }) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof coverageFormSchema>>({
    resolver: zodResolver(coverageFormSchema),
    defaultValues: {
      identifier: "",
      subscriber_id: "",
      payor_identifier: "",
      payor_name: "",
      payor_search_text: "",
    },
  });

  const { mutate: createCoverage, isPending: createCoverageIsPending } =
    useMutation({
      mutationFn: apis.coverage.create,
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: ["coverages", patientId],
        });
        toast.success("Coverage added successfully");
      },
    });

  const { mutate: deleteCoverage, isPending: deleteCoverageIsPending } =
    useMutation({
      mutationFn: apis.coverage.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["coverages", patientId],
        });
        toast.success("Coverage deleted successfully");
      },
    });

  function onSubmit(values: z.infer<typeof coverageFormSchema>) {
    createCoverage({
      beneficiary: patientId,
      identifier: values.identifier,
      subscriber_id: values.subscriber_id,
      payor: {
        identifier: values.payor_identifier,
        name: values.payor_name,
      },
      status: "active",
      kind: "insurance",
    });
  }

  const { data: coverages } = useQuery({
    queryKey: ["coverages", patientId],
    queryFn: () =>
      apis.coverage.list({ beneficiary: patientId, ordering: "-created_date" }),
    enabled: !!patientId,
  });

  const { data: payors } = useQuery({
    queryKey: ["payors", form.watch("payor_search_text")],
    queryFn: () => apis.coverage.payors(form.watch("payor_search_text") ?? ""),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Coverages</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-fit overflow-auto">
        <DialogHeader>
          <DialogTitle>Manage Coverages</DialogTitle>
          <DialogDescription>
            Add or remove coverages for the patient
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Add Coverage</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Coverage Id
                          <span className="text-red-500 text-sm ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Coverage Id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subscriber_id"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Subscriber Id
                          <span className="text-red-500 text-sm ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Subscriber Id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payor_identifier"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 sm:col-span-2">
                        <FormLabel>
                          Payor
                          <span className="text-red-500 text-sm ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Autocomplete
                            {...field}
                            options={
                              payors?.map((payor) => ({
                                label: `${payor.name} - ${payor.code}`,
                                value: `${payor.name}::::${payor.code}`,
                              })) ?? []
                            }
                            onChange={(selected) => {
                              const [name, code] = selected.split("::::");
                              form.setValue("payor_name", name);
                              form.setValue("payor_identifier", code);
                            }}
                            value={`${form.watch("payor_name")}::::${form.watch(
                              "payor_identifier"
                            )}`}
                            onSearch={(text) =>
                              form.setValue("payor_search_text", text)
                            }
                            placeholder="Select a coverage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  loading={createCoverageIsPending}
                  type="submit"
                  className="w-full"
                >
                  Add Coverage
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <ScrollArea className="w-full max-h-96 pr-3">
          <div className="space-y-4">
            {coverages?.results.map((coverage, i) => {
              const status = getCoverageVerificationStatus(coverage);
              return (
                <Card key={coverage.id} className="w-full">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle>Coverage {i + 1}</CardTitle>
                      <Description className="text-sm text-gray-500">
                        Added on {formatDate(coverage.created_date)}
                      </Description>
                      <Description>
                        <Badge
                          className={cn("capitalize text-xs", {
                            "bg-green-200 text-green-600":
                              status === "verified",
                            "bg-red-200 text-red-600": status === "rejected",
                            "bg-yellow-200 text-yellow-600":
                              status === "pending",
                          })}
                        >
                          {status}
                          {status !== "pending" && (
                            <span className="normal-case ml-1">
                              on{" "}
                              {formatDate(
                                coverage.latest_coverage_eligibility_response
                                  ?.created_date!
                              )}
                            </span>
                          )}
                        </Badge>
                      </Description>
                    </div>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                type="button"
                                onClick={() => {
                                  deleteCoverage(coverage.id);
                                }}
                                disabled={
                                  deleteCoverageIsPending ||
                                  status !== "pending"
                                }
                                variant="ghost"
                                size="icon"
                              >
                                <TrashIcon className="text-red-600" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {status !== "pending" && (
                            <TooltipContent>
                              <p>
                                Coverage cannot be deleted once it is verified.
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Coverage Id</Label>
                      <p className="text-sm font-medium">
                        {coverage.identifier}
                      </p>
                    </div>
                    <div>
                      <Label>Subscriber Id</Label>
                      <p className="text-sm font-medium">
                        {coverage.subscriber_id}
                      </p>
                    </div>
                    <div>
                      <Label>Payor Id</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium truncate">
                              {coverage.payor.identifier}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{coverage.payor.identifier}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div>
                      <Label>Payor Name</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm font-medium truncate">
                              {coverage.payor.name}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{coverage.payor.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

type ClaimFormProps = {
  encounter: Encounter;
  coverage?: Coverage;
};

const claimFormSchema = z.object({
  items: z
    .array(
      z.object({
        category: z.object({
          code: z.string().min(2, {
            message: "Category code must be at least 2 characters.",
          }),
          display: z.string().min(2, {
            message: "Category display must be at least 2 characters.",
          }),
          system: z.string().min(2, {
            message: "Category system must be at least 2 characters.",
          }),
        }),
        product_or_service: z.object({
          code: z.string().min(2, {
            message: "Product or service code must be at least 2 characters.",
          }),
          display: z.string().min(2, {
            message:
              "Product or service display must be at least 2 characters.",
          }),
          system: z.string().min(2, {
            message: "Product or service system must be at least 2 characters.",
          }),
        }),
        unit_price: z.number().min(1, {
          message: "Price must be greater than 0.",
        }),
        quantity: z.number().int().min(1, {
          message: "Quantity must be greater than or equal to 1.",
        }),
      })
    )
    .min(1, { message: "At least one item is required." }),
  attachments: z.array(z.string()),
  use: z.enum(CLAIM_USES),
  priority: z.enum(CLAIM_PRIORITIES),
});

const ClaimForm: FC<ClaimFormProps> = ({ encounter, coverage }) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof claimFormSchema>>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      items: [],
      attachments: [],
      use: "claim",
      priority: "normal",
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const { data: priorClaim, isLoading: priorClaimIsLoading } = useQuery({
    queryKey: ["claims", encounter.id, "latest"],
    queryFn: () =>
      apis.claim.latest({
        encounter: encounter.id,
      }),
    enabled: !!encounter.id,
  });

  useEffect(() => {
    if (priorClaim?.item) {
      form.setValue(
        "items",
        priorClaim.item
          .filter((item) => item.category)
          .map((item) => ({
            category: {
              code: item.category!.code!,
              display: item.category!.display!,
              system: item.category!.system!,
            },
            product_or_service: {
              code: item.product_or_service.code!,
              display: item.product_or_service.display!,
              system: item.product_or_service.system!,
            },
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
      );
    }
  }, [priorClaim]);

  const {
    Input: FileInput,
    files,
    error,
    removeFile,
    clearFiles,
    handleFileUpload,
    validateFiles,
  } = useFileUpload({
    multiple: true,
    category: "unspecified",
    type: "encounter",
    allowedExtensions: [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
    ],
    onUpload: (file) => {
      form.setValue("attachments", [
        ...(form.getValues("attachments") ?? []),
        file.id!,
      ]);
    },
  });

  const { mutate: submitClaim } = useMutation({
    mutationFn: apis.claim.submit,
    onSuccess: () => {
      toast.success("Claim submitted successfully");
    },
  });

  const { mutate: createClaim, isPending: createClaimIsPending } = useMutation({
    mutationFn: apis.claim.create,
    onSuccess: (data) => {
      form.reset();
      clearFiles();
      queryClient.invalidateQueries({
        queryKey: ["claims", encounter.id],
      });
      toast.success("Claim created successfully");
      submitClaim(data.id);
    },
  });

  async function onSubmit(_values: z.infer<typeof claimFormSchema>) {
    if (!validateFiles()) {
      return;
    }

    if (files.length) {
      await handleFileUpload(encounter.id);
    }

    if (!coverage) {
      toast.error("Coverage is required to create a claim");
      return;
    }

    const { items, attachments, use, priority } = form.getValues();
    createClaim({
      type: "institutional",
      status: "active",
      use,
      priority,
      encounter: encounter.id,
      insurance: [
        {
          sequence: 1,
          focal: true,
          coverage: coverage.id,
        },
      ],
      item: items.map((item, i) => ({
        sequence: i + 1,
        category: item.category,
        product_or_service: item.product_or_service,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      supporting_info: attachments.map((attachment, i) => ({
        sequence: i + 1,
        category: {
          system:
            "http://hcxprotocol.io/codes/claim-supporting-info-categories",
          code: "ATT",
          display: "Attachment",
        },
        attachment,
      })),
    });
  }

  if (priorClaimIsLoading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Loader2Icon className="animate-spin" />
        <span>Auto populating Products and Services from previous claim.</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card>
              <CardHeader>
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.category`}
                  render={({ field }) => (
                    <div className="flex justify-between items-center gap-2">
                      <FormItem className="space-y-1.5 w-full">
                        <FormLabel>
                          Category
                          <span className="text-red-500 text-sm ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Autocomplete
                            options={CLAIM_ITEM_CATEGORIES.map((category) => ({
                              label: category.display,
                              value: `${category.code}::::${category.display}::::${category.system}`,
                            }))}
                            value={`${field.value.code}::::${field.value.display}::::${field.value.system}`}
                            onChange={(value) => {
                              const [code, display, system] =
                                value.split("::::");
                              form.setValue(`items.${index}.category`, {
                                code,
                                display,
                                system,
                              });
                            }}
                            placeholder="Select a category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          remove(index);
                        }}
                        className="mt-4"
                      >
                        <CircleMinusIcon className="h-6 w-6 text-danger-500" />
                      </Button>
                    </div>
                  )}
                />
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <CardTitle className="sm:col-span-2">
                  Product or Service
                </CardTitle>
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.product_or_service.code`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>
                        Code
                        <span className="text-red-500 text-sm ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.product_or_service.display`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>
                        Title
                        <span className="text-red-500 text-sm ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>
                        Price / Unit
                        <span className="text-red-500 text-sm ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            form.setValue(
                              `items.${index}.unit_price`,
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>
                        Quantity
                        <span className="text-red-500 text-sm ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            form.setValue(
                              `items.${index}.quantity`,
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <FormLabel />
                <FormControl>
                  <Autocomplete
                    options={CLAIM_ITEM_CATEGORIES.map((category) => ({
                      label: category.display,
                      value: `${category.code}::::${category.display}::::${category.system}`,
                    }))}
                    value=""
                    onChange={(value) => {
                      const [code, display, system] = value.split("::::");
                      append({
                        category: {
                          code,
                          display,
                          system,
                        },
                        product_or_service: {
                          code: "",
                          display: "",
                          system: "https://pmjay.gov.in/hbp-package-code",
                        },
                        unit_price: undefined as unknown as number,
                        quantity: undefined as unknown as number,
                      });
                    }}
                    placeholder="Select a category"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex w-full items-center flex-col">
          <div className="relative w-full flex-1">
            <div className="bottom-full flex max-w-full items-center gap-2 overflow-x-auto rounded-md bg-white p-2">
              {files.map((file, i) => (
                <div
                  key={file.name}
                  className="flex min-w-36 max-w-36 items-center gap-2"
                >
                  <div>
                    {file.type.includes("image") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-300">
                        <FileIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="w-24 truncate text-sm">{file.name}</p>
                    <div className="flex !items-center gap-2.5">
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        onClick={() => {
                          removeFile(i);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-danger-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full">
            <Button
              type="button"
              variant="secondary"
              className="flex items-center justify-center w-full"
            >
              <Label className="button-size-default button-shape-square button-primary-default inline-flex h-min w-full cursor-pointer items-center justify-center gap-2 whitespace-pre font-medium outline-offset-1 transition-all duration-200 ease-in-out">
                <PaperclipIcon className="h-5 w-5" />
                <span>Add Attachments</span>
                <FileInput />
              </Label>
            </Button>
            {error && (
              <p className="pt-1.5 text-xs font-medium text-danger-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Type
                  <span className="text-red-500 text-sm ml-0.5">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        className="capitalize"
                        placeholder="Select a type"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLAIM_USES.map((use) => (
                      <SelectItem className="capitalize" value={use}>
                        {use}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Priority
                  <span className="text-red-500 text-sm ml-0.5">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        className="capitalize"
                        placeholder="Select a priority"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLAIM_PRIORITIES.map((priority) => (
                      <SelectItem className="capitalize" value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button loading={createClaimIsPending} type="submit" className="w-full">
          Create and Submit Claim
        </Button>
      </form>
    </Form>
  );
};

export default ClaimsEncounterTab;
