import { CLAIM_ITEM_CATEGORIES, I18NNAMESPACE } from "@/lib/constants";
import { CLAIM_PRIORITIES, CLAIM_USES } from "@/types/claim";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CircleMinusIcon,
  FileIcon,
  PaperclipIcon,
  TrashIcon,
} from "lucide-react";
import { FC, useEffect } from "react";
import {
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
import { useMutation, useQuery } from "@tanstack/react-query";

import Autocomplete from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { Coverage } from "@/types/coverage";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { apis } from "@/apis";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import useFileUpload from "@/hooks/use-file-upload";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ClaimFormProps = {
  encounterId: string;
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

export const ClaimForm: FC<ClaimFormProps> = ({ encounterId, coverage }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation(I18NNAMESPACE);

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
    queryKey: ["claims", encounterId, "latest"],
    queryFn: () =>
      apis.claim.latest({
        encounter: encounterId,
      }),
    enabled: !!encounterId,
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
      toast.success(t("claim_submitted_successfully"));
    },
  });

  const { mutate: createClaim, isPending: createClaimIsPending } = useMutation({
    mutationFn: apis.claim.create,
    onSuccess: (data) => {
      form.reset();
      clearFiles();
      queryClient.invalidateQueries({
        queryKey: ["claims", encounterId],
      });
      toast.success(t("claim_created_successfully"));
      submitClaim(data.id);
    },
  });

  async function onSubmit(_values: z.infer<typeof claimFormSchema>) {
    console.log(_values);
    if (!validateFiles()) {
      return;
    }

    if (files.length) {
      await handleFileUpload(encounterId);
    }

    if (!coverage) {
      toast.error(t("coverage_required_error"));
      return;
    }

    const { items, attachments, use, priority } = form.getValues();
    createClaim({
      type: "institutional",
      status: "active",
      use,
      priority,
      encounter: encounterId,
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
        <span>{t("auto_populating_previous_claim")}</span>
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
                          {t("category")}
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
                  {t("product_or_service")}
                </CardTitle>
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`items.${index}.product_or_service.code`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>
                        {t("code")}
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
                        {t("title")}
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
                        {t("price_per_unit")}
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
                        {t("quantity")}
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
                    <div className="flex items-center! gap-2.5">
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
                <span>{t("add_attachments")}</span>
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
                  {t("type")}
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
                  {t("priority")}
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
          {t("create_and_submit_claim")}
        </Button>
      </form>
    </Form>
  );
};
