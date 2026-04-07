"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { useHasRole } from "@/hooks/useHasRole";
import { useTRPC } from "@/lib/trpc";

export default function MentorshipPairsPage() {
  const trpc = useTRPC();
  const isAdmin = useHasRole("global:admin");

  const { data, isLoading, error } = useQuery({
    ...trpc.mentorship.getAdminPairs.queryOptions(),
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <AuthGuard>
        <NavigationShell showCommsNav={false}>
          <TitleShell
            title="Access Denied"
            backHref="/mentorship/admin"
            backAriaLabel="Back to admin"
          >
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-800">
                You do not have permission to view this page.
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
          title="Mentorship Pairs"
          backHref="/mentorship/admin"
          backAriaLabel="Back to admin"
        >
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  Failed to load pairs. Please try again.
                </p>
              </div>
            )}

            {data && data.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-600">
                  No active mentorship pairs yet.
                </p>
              </div>
            )}

            {data && data.length > 0 && (
              <div className="rounded-lg border bg-card divide-y">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Mentor
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Mentee
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Matched On
                  </p>
                </div>
                {data.map((pair) => (
                  <div
                    key={pair.matchId}
                    className="grid grid-cols-3 gap-4 px-4 py-4 items-center"
                  >
                    {/* Mentor */}
                    <div>
                      <p className="font-medium text-sm">
                        {pair.mentorName ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pair.mentorEmail ?? ""}
                      </p>
                      {pair.mentorRank && (
                        <p className="text-xs text-muted-foreground">
                          {pair.mentorRank}
                        </p>
                      )}
                    </div>
                    {/* Mentee */}
                    <div>
                      <p className="font-medium text-sm">
                        {pair.menteeName ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pair.menteeEmail ?? ""}
                      </p>
                      {pair.menteeRank && (
                        <p className="text-xs text-muted-foreground">
                          {pair.menteeRank}
                        </p>
                      )}
                    </div>
                    {/* Matched At */}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pair.matchedAt).toLocaleDateString()}
                      </p>
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
