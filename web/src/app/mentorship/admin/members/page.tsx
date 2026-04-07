"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { useHasRole } from "@/hooks/useHasRole";
import { useTRPC } from "@/lib/trpc";

type Tab = "mentors" | "mentees";

export default function MentorshipMembersPage() {
  const trpc = useTRPC();
  const isAdmin = useHasRole("global:admin");
  const [activeTab, setActiveTab] = useState<Tab>("mentors");

  const { data, isLoading, error } = useQuery({
    ...trpc.mentorship.getAdminMembers.queryOptions(),
    enabled: isAdmin,
  });

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

  const members = activeTab === "mentors" ? data?.mentors : data?.mentees;

  return (
    <AuthGuard>
      <NavigationShell showCommsNav={false}>
        <TitleShell title="Mentorship Member List" backHref="/mentorship/admin" backAriaLabel="Back to admin">
          <div className="w-full max-w-4xl mx-auto space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 rounded-md border bg-muted p-1 w-fit">
              {(["mentors", "mentees"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab} {data && `(${activeTab === tab ? members?.length ?? 0 : (tab === "mentors" ? data.mentors.length : data.mentees.length)})`}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">Failed to load members. Please try again.</p>
              </div>
            )}

            {members && members.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-600">No {activeTab} enrolled yet.</p>
              </div>
            )}

            {members && members.length > 0 && (
              <div className="rounded-lg border bg-card divide-y">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Name</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Rank</p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                </div>
                {members.map((member) => (
                  <div key={member.userId} className="grid grid-cols-3 gap-4 px-4 py-4 items-center">
                    <div>
                      <p className="font-medium text-sm">{member.name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{member.email ?? ""}</p>
                    </div>
                    <div>
                      <p className="text-sm">{member.rank ?? "—"}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : member.status === "matched"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {member.status}
                      </span>
                    </div>
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