"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  PenLine,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AuthGuard } from "@/components/auth/auth-guard";
import NavigationShell from "@/components/layouts/navigation-shell";
import { TitleShell } from "@/components/layouts/title-shell";
import { useHasRole } from "@/hooks/useHasRole";
import { authClient } from "@/lib/auth-client";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

// action buttons
const actions: {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    label: "View Pairs",
    href: "/mentorship/admin/pairs" as Route,
    icon: FileText,
  },
  {
    label: "Mentorship Member List",
    href: "/mentorship/admin/members" as Route,
    icon: Users,
  },
  {
    label: "Manage Mentor Applications",
    href: "/mentorship/admin/applications" as Route,
    icon: PenLine,
  },
];

// statistics card
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-3 shadow-sm">
      <p className="text-base font-semibold text-center">{label}</p>
      <p className="text-4xl font-bold italic text-accent text-center">
        {value}
      </p>
    </div>
  );
}

// growth card with trend indicator
function GrowthCard({
  label,
  newCount,
  changePercent,
}: {
  label: string;
  newCount: number;
  changePercent: number;
}) {
  const isUp = changePercent >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? "text-green-600" : "text-red-500";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-3 shadow-sm">
      <p className="text-base font-semibold text-center">{label}</p>
      <p className="text-4xl font-bold italic text-accent text-center">
        {newCount}
      </p>
      <div
        className={`flex items-center justify-center gap-1 text-base font-bold ${trendColor}`}
      >
        <TrendIcon className="h-4 w-4" />
        <span>{Math.abs(changePercent)}% over the last 30 days</span>
      </div>
    </div>
  );
}

// main page
export default function MentorshipAdminPage() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const isAdmin = useHasRole("global:admin");

  const { data: sessionData } = authClient.useSession();
  const userId = sessionData?.user.id ?? null;

  const { data: userData } = useQuery({
    queryKey: ["admin-user-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      return trpcClient.user.getUserData.query({ user_id: userId });
    },
  });

  const name = userData?.name ?? sessionData?.user.name ?? "";
  const rank = userData?.rank ?? "";
  const displayName = [rank, name].filter(Boolean).join(" ");

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
            backHref="/admin"
            backAriaLabel="Back to admin"
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
          title="Admin Page"
          backHref="/admin"
          backAriaLabel="Back to admin"
        >
          <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Welcome Header */}
            <h1 className="text-3xl font-bold">
              <span className="italic text-accent">Welcome Back,</span>{" "}
              {displayName || "Admin"}.
            </h1>

            {/* Mentorship Actions */}
            <section>
              <h2 className="text-xl font-bold mb-4">Mentorship Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actions.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-primary hover:bg-primary/90 text-white p-5 text-center text-sm font-semibold transition-colors"
                  >
                    <Icon className="h-6 w-6" />
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            {/* GuardConnect Statistics */}
            <section>
              <h2 className="text-xl font-bold mb-4">
                GuardConnect Statistics
              </h2>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    Failed to load statistics. Please try again.
                  </p>
                </div>
              )}

              {data && (
                <div className="space-y-6">
                  {/* Main stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Users"
                      value={data.mentors.total + data.mentees.total}
                    />
                    <StatCard
                      label="Users Active Now"
                      value={data.mentors.active + data.mentees.active}
                    />
                    <StatCard
                      label="Number of Mentees Waiting for Pairing"
                      value={data.mentees.active}
                    />
                    <StatCard
                      label="Number of Active Mentorship Pairs"
                      value={data.matches.accepted}
                    />
                  </div>

                  {/* Growth stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <GrowthCard
                      label="New Mentors (Last 30 Days)"
                      newCount={data.growth.newMentorsLast30Days}
                      changePercent={data.growth.mentorChangePercent}
                    />
                    <GrowthCard
                      label="New Mentees (Last 30 Days)"
                      newCount={data.growth.newMenteesLast30Days}
                      changePercent={data.growth.menteeChangePercent}
                    />
                  </div>

                  {/* Enrollment chart */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold mb-4">
                      Program Enrollment (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={data.growth.dailyEnrollment}
                        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                          interval={4}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(val) =>
                            new Date(val).toLocaleDateString()
                          }
                          formatter={(value, name) => [
                            value,
                            name === "mentors" ? "Mentors" : "Mentees",
                          ]}
                        />
                        <Legend
                          formatter={(value) =>
                            value === "mentors" ? "Mentors" : "Mentees"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="mentors"
                          stroke="#283396"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="mentees"
                          stroke="#dda139"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>
          </div>
        </TitleShell>
      </NavigationShell>
    </AuthGuard>
  );
}
