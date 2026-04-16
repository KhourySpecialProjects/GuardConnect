"use client";

import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { Mail } from "lucide-react";
import { useState } from "react";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { useHasRole } from "@/hooks/useHasRole";
import type { InferTRPCOutput, TRPCProcedures } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc";
import { BatchInviteResults } from "./batch-invite-results";
import {
  SendInvitesForm,
  type SendInvitesFormValues,
} from "./send-invites-form";

type BatchResult = InferTRPCOutput<
  TRPCProcedures["inviteCodes"]["sendBatchInvites"]
>;

export default function SendInvitesPage() {
  const trpc = useTRPC();
  const hasPermission = useHasRole("global:create-invite");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);

  const sendBatchInvites = useMutation(
    trpc.inviteCodes.sendBatchInvites.mutationOptions(),
  );

  if (!hasPermission) {
    return (
      <NavigationShell showCommsNav={false}>
        <TitleShell
          title="Access Denied"
          backHref="/admin/invites"
          backAriaLabel="Back to invite codes"
        >
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-800">
              You do not have permission to send invite codes.
            </p>
          </div>
        </TitleShell>
      </NavigationShell>
    );
  }

  const handleSubmit = async (values: SendInvitesFormValues) => {
    setError(null);

    try {
      const data = await sendBatchInvites.mutateAsync({
        emails: values.emails,
        roleKeys: values.roleKeys,
        expiresInHours: values.expiresInHours,
      });
      setResult(data as BatchResult);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        const zodMessage = err.data?.zodError?.fieldErrors?.emails?.[0];
        if (zodMessage) {
          setError(zodMessage);
          return;
        }
        setError(err.message);
        return;
      }
      setError("Failed to send invites. Please try again.");
    }
  };

  const handleSendAnother = () => {
    setResult(null);
    setError(null);
  };

  return (
    <NavigationShell showCommsNav={false}>
      <TitleShell
        title="Send Invites"
        backHref="/admin/invites"
        backAriaLabel="Back to invite codes"
      >
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Info Section */}
          {!result && (
            <div className="rounded-lg border border-primary bg-white p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-primary">
                    Batch Email Invites
                  </h3>
                  <p className="mt-1 text-sm text-primary">
                    Enter email addresses below. Each recipient will receive a
                    unique invite link granting the selected permissions. Up to
                    50 emails per batch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {result ? (
            <BatchInviteResults
              result={result}
              onSendAnother={handleSendAnother}
            />
          ) : (
            <SendInvitesForm
              onSubmit={handleSubmit}
              submitting={sendBatchInvites.isPending}
              error={error}
            />
          )}
        </div>
      </TitleShell>
    </NavigationShell>
  );
}
