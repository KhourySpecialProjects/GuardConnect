"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { useHasRole } from "@/hooks/useHasRole";
import { useTRPC } from "@/lib/trpc";

type MentorStatus = "requested" | "approved" | "active";

const STATUS_TABS: { value: MentorStatus; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
];

const NEXT_STATUS: Record<MentorStatus, MentorStatus | null> = {
  requested: "approved",
  approved: "active",
  active: null,
};

const NEXT_STATUS_LABEL: Record<MentorStatus, string> = {
  requested: "Approve",
  approved: "Activate",
  active: "",
};

export default function MentorApplicationsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isAdmin = useHasRole("global:admin");
  const [activeTab, setActiveTab] = useState<MentorStatus>("requested");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: mentors, isLoading } = useQuery(
    trpc.mentorship.getPendingMentors.queryOptions({ status: activeTab }),
  );

  const updateStatus = useMutation(
    trpc.mentorship.updateMentorStatus.mutationOptions({
      onSuccess: () => {
        setPendingId(null);
        queryClient.invalidateQueries(trpc.mentorship.getPendingMentors.queryOptions({ status: "requested" }));
        queryClient.invalidateQueries(trpc.mentorship.getPendingMentors.queryOptions({ status: "approved" }));
        queryClient.invalidateQueries(trpc.mentorship.getPendingMentors.queryOptions({ status: "active" }));
        queryClient.invalidateQueries(trpc.mentorship.getAdminStats.queryOptions());
      },
      onError: () => setPendingId(null),
    }),
  );

  const nextStatus = NEXT_STATUS[activeTab];

  if (!isAdmin) {
    return (
      <AuthGuard>
        <NavigationShell showCommsNav={false}>
          <TitleShell title="Access Denied" backHref="/mentorship/admin" backAriaLabel="Back to admin">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-800">You do not have permission to view this page.</p>
            </div>
          </TitleShell>
        </NavigationShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <NavigationShell showCommsNav={false}>
        <TitleShell title="Mentor Applications" backHref="/mentorship/admin" backAriaLabel="Back to admin">
          <div className="w-full max-w-4xl mx-auto space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 rounded-md border bg-muted p-1 w-fit">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.value
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && mentors?.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-600">No {activeTab} mentor applications.</p>
              </div>
            )}

            {!isLoading && mentors && mentors.length > 0 && (
              <div className="rounded-lg border bg-card divide-y">
                {mentors.map((mentor) => (
                  <div key={mentor.userId} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{mentor.name ?? "Unknown"}</p>
                      <p className="text-sm text-muted-foreground truncate">{mentor.email}</p>
                      {mentor.rank && <p className="text-sm text-muted-foreground">{mentor.rank}</p>}
                    </div>
                    {nextStatus && (
                      <button
                        type="button"
                        disabled={pendingId === mentor.userId}
                        onClick={() => {
                          setPendingId(mentor.userId);
                          updateStatus.mutate({ mentorUserId: mentor.userId, status: nextStatus });
                        }}
                        className="ml-4 shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {pendingId === mentor.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          NEXT_STATUS_LABEL[activeTab]
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TitleShell>
      </NavigationShell>
    </AuthGuard>
  );
}