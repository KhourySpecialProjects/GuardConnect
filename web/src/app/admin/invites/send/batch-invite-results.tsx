"use client";

import { CheckCircle2, Link as LinkIcon, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BatchResult = {
  total: number;
  sent: number;
  failed: number;
  results: Array<{
    email: string;
    success: boolean;
    code?: string;
    error?: string;
  }>;
};

type BatchInviteResultsProps = {
  result: BatchResult;
  onSendAnother: () => void;
};

export function BatchInviteResults({
  result,
  onSendAnother,
}: BatchInviteResultsProps) {
  const allSuccess = result.failed === 0;
  const allFailed = result.sent === 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Summary Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 ${
          allFailed
            ? "border-red-200 bg-red-50"
            : allSuccess
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {allFailed ? (
            <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2
              className={`h-6 w-6 shrink-0 mt-0.5 ${allSuccess ? "text-green-600" : "text-amber-600"}`}
            />
          )}
          <div>
            <p
              className={`font-semibold text-base ${
                allFailed
                  ? "text-red-800"
                  : allSuccess
                    ? "text-green-800"
                    : "text-amber-800"
              }`}
            >
              {allFailed
                ? "No invitations sent"
                : allSuccess
                  ? "All invitations sent"
                  : "Some invitations sent"}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                allFailed
                  ? "text-red-700"
                  : allSuccess
                    ? "text-green-700"
                    : "text-amber-700"
              }`}
            >
              {result.sent} of {result.total} invitation
              {result.total !== 1 ? "s" : ""} sent successfully.
              {result.failed > 0 &&
                ` ${result.failed} failed — those codes are still valid and appear in the invite list.`}
            </p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-secondary">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-secondary hidden sm:table-cell">
                  Code
                </th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((row, i) => (
                <tr
                  key={row.email}
                  className={`border-b border-border last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-muted/20"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-secondary break-all">
                    {row.email}
                  </td>
                  <td className="px-4 py-3">
                    {row.success ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Sent
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-700 text-xs font-medium"
                        title={row.error}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary/70 hidden sm:table-cell">
                    {row.code ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={onSendAnother} className="w-full sm:w-auto">
          Send Another Batch
        </Button>
        <Link href="/admin/invites">
          <Button className="w-full sm:w-auto gap-2">
            <LinkIcon className="h-4 w-4" />
            View All Codes
          </Button>
        </Link>
      </div>
    </div>
  );
}
