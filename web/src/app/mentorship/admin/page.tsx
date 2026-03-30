"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHasRole } from "@/hooks/useHasRole";
import { useTRPC } from "@/lib/trpc";

type MentorStatus = "requested" | "approved" | "active";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBreakdown({
  label,
  items,
}: {
  label: string;
  items: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">{label}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="text-sm capitalize text-muted-foreground">
              {item.name}
            </span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function MentorApplicationsList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MentorStatus>("requested");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: mentors, isLoading } = useQuery(
    trpc.mentorship.getPendingMentors.queryOptions({ status: activeTab }),
  );

  const updateStatus = useMutation(
    trpc.mentorship.updateMentorStatus.mutationOptions({
      onSuccess: () => {
        setPendingId(null);
        queryClient.invalidateQueries(
          trpc.mentorship.getPendingMentors.queryOptions({
            status: "requested",
          }),
        );
        queryClient.invalidateQueries(
          trpc.mentorship.getPendingMentors.queryOptions({
            status: "approved",
          }),
        );
        queryClient.invalidateQueries(
          trpc.mentorship.getPendingMentors.queryOptions({ status: "active" }),
        );
        queryClient.invalidateQueries(
          trpc.mentorship.getAdminStats.queryOptions(),
        );
      },
      onError: () => setPendingId(null),
    }),
  );

  const nextStatus = NEXT_STATUS[activeTab];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <p className="text-sm font-semibold">Mentor Applications</p>

      {/* Tabs */}
      <div className="flex gap-1 rounded-md border bg-muted p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
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
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && mentors?.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No {activeTab} mentor applications.
        </p>
      )}

      {!isLoading && mentors && mentors.length > 0 && (
        <div className="divide-y">
          {mentors.map((mentor) => (
            <div
              key={mentor.userId}
              className="flex items-center justify-between py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {mentor.name ?? "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {mentor.email}
                </p>
                {mentor.rank && (
                  <p className="text-xs text-muted-foreground">{mentor.rank}</p>
                )}
              </div>

              {nextStatus && (
                <button
                  type="button"
                  disabled={pendingId === mentor.userId}
                  onClick={() => {
                    setPendingId(mentor.userId);
                    updateStatus.mutate({
                      mentorUserId: mentor.userId,
                      status: nextStatus,
                    });
                  }}
                  className="ml-4 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {pendingId === mentor.userId ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
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
  );
}

export default function MentorshipAdminPage() {
  const trpc = useTRPC();
  const isAdmin = useHasRole("global:admin");

  const { data, isLoading, error } = useQuery({
    ...trpc.mentorship.getAdminStats.queryOptions(),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <AuthGuard>
        <NavigationShell showCommsNav={false}>
          <TitleShell
            title="Access Denied"
            backHref="/mentorship/dashboard"
            backAriaLabel="Back to mentorship"
          >
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-800">
                You do not have permission to view mentorship admin stats.
              </p>
            </div>
          </TitleShell>
        </NavigationShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <NavigationShell showCommsNav={false}>
        <TitleShell
          title="Mentorship Admin"
          backHref="/admin"
          backAriaLabel="Back to admin"
        >
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-800">
                  Failed to load mentorship stats. Please try again.
                </p>
              </div>
            )}

            {data && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Mentors"
                    value={data.mentors.total}
                    subtitle={`${data.mentors.acceptingNewMatches} accepting new matches`}
                  />
                  <StatCard title="Total Mentees" value={data.mentees.total} />
                  <StatCard
                    title="Active Pairs"
                    value={data.matches.accepted}
                  />
                  <StatCard
                    title="Pending Requests"
                    value={data.matches.pending}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard
                    title="Total Match Requests"
                    value={data.matches.total}
                  />
                  <StatCard
                    title="Decline Rate"
                    value={`${data.matches.declineRate}%`}
                    subtitle={`${data.matches.declined} declined of ${data.matches.total} total`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatusBreakdown
                    label="Mentors by Status"
                    items={[
                      { name: "Requested", value: data.mentors.requested },
                      { name: "Approved", value: data.mentors.approved },
                      { name: "Active", value: data.mentors.active },
                    ]}
                  />
                  <StatusBreakdown
                    label="Mentees by Status"
                    items={[
                      { name: "Active", value: data.mentees.active },
                      { name: "Matched", value: data.mentees.matched },
                      { name: "Inactive", value: data.mentees.inactive },
                    ]}
                  />
                  <StatusBreakdown
                    label="Matches by Status"
                    items={[
                      { name: "Pending", value: data.matches.pending },
                      { name: "Accepted", value: data.matches.accepted },
                      { name: "Declined", value: data.matches.declined },
                    ]}
                  />
                </div>
              </>
            )}

            <MentorApplicationsList />
          </div>
        </TitleShell>
      </NavigationShell>
    </AuthGuard>
  );
}
