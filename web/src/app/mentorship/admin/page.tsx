"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileText,
  Loader2,
  PenLine,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";
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

// make the rank introduction just the title, not the number ("Seargent" not "e5-seargent")
function parseRank(rank: string): string {
  const parts = rank.split("-");
  if (parts.length < 2) return rank;
  const words = parts.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ");
}

// action buttons
const actions: {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    label: "View Matches",
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

const DAY_OPTIONS = [30, 90, 180] as const;
type DayOption = typeof DAY_OPTIONS[number];

// statistics card
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between h-36 shadow-sm">
      <p className="text-base font-semibold text-center leading-tight">{label}</p>
      <p className="text-4xl font-bold italic text-accent text-center">{value}</p>
    </div>
  );
}

// growth card with trend indicator
function GrowthCard({
  label,
  newCount,
  changePercent,
  days,
}: {
  label: string;
  newCount: number;
  changePercent: number;
  days: number;
}) {
  const isUp = changePercent >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? "text-green-600" : "text-red-500";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between h-36 shadow-sm">
      <p className="text-base font-semibold text-center leading-tight">{label}</p>
      <p className="text-4xl font-bold italic text-accent text-center">{newCount}</p>
      <div className={`flex items-center justify-center gap-1 text-sm font-medium ${trendColor}`}>
        <TrendIcon className="h-4 w-4" />
        <span>{Math.abs(changePercent)}% vs previous {days} days</span>
      </div>
    </div>
  );
}

// main page
export default function MentorshipAdminPage() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const isAdmin = useHasRole("global:admin");
  const [selectedDays, setSelectedDays] = useState<DayOption>(30);
  const statsRef = useRef<HTMLDivElement>(null);

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
  const rawRank = userData?.rank ?? "";
  const rank = rawRank ? parseRank(rawRank) : "";
  const displayName = [rank, name].filter(Boolean).join(" ");

  const { data, isLoading, error } = useQuery({
    ...trpc.mentorship.getAdminStats.queryOptions({ days: selectedDays }),
    enabled: isAdmin,
    placeholderData: (prev) => prev,
  });

  const handleDownload = () => {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const printWindow = window.open("", "_blank");
    if (!printWindow || !data || !statsRef.current) return;

    const chartHTML = statsRef.current.querySelector(".recharts-responsive-container")?.outerHTML ?? "";

    const content = `
      <html>
        <head>
          <title>GuardConnect Mentorship Statistics — ${date}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #222; }
            h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
            h2 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
            .date { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
            .stat { font-size: 1rem; margin: 0.4rem 0; }
            .stat span { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>GuardConnect Mentorship Statistics</h1>
          <div class="date">Generated on ${date} — Last ${selectedDays} days</div>
          <h2>GuardConnect Mentorship Statistics</h2>
          <p class="stat">Total Mentorship Participants: <span>${data.mentors.total + data.mentees.total}</span></p>
          <p class="stat">Mentorship Users Active Now: <span>${data.mentors.active + data.mentees.active}</span></p>
          <p class="stat">Number of Mentees Waiting for Matching: <span>${data.mentees.active}</span></p>
          <h2>GuardConnect Mentorship Growth Statistics (Last ${selectedDays} Days)</h2>
          <p class="stat">New Mentors: <span>${data.growth.newMentors}</span> (${
            data.growth.mentorChangePercent === 0
              ? `up 0% vs previous ${selectedDays} days`
              : `${Math.abs(data.growth.mentorChangePercent)}% ${data.growth.mentorChangePercent > 0 ? "up" : "down"} vs previous ${selectedDays} days`
          })</p>
          <p class="stat">New Mentees: <span>${data.growth.newMentees}</span> (${
            data.growth.menteeChangePercent === 0
              ? `up 0% vs previous ${selectedDays} days`
              : `${Math.abs(data.growth.menteeChangePercent)}% ${data.growth.menteeChangePercent > 0 ? "up" : "down"} vs previous ${selectedDays} days`
          })</p>
          <p class="stat">Active Mentorship Pairs: <span>${data.matches.acceptedThisPeriod}</span></p>
          <h2>Program Enrollment (Last ${selectedDays} Days)</h2>
          ${chartHTML}
        </body>
      </html>
    `;

    printWindow.document.body.innerHTML = content;
    printWindow.print();
  };

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
          title="Admin Mentorship Dashboard"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* GuardConnect Mentorship Statistics */}
            <section>
              <h2 className="text-xl font-bold mb-4">
                GuardConnect Mentorship Statistics
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
                <div className="space-y-6" ref={statsRef}>
                  {/* Main stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard
                      label="Total Mentorship Users"
                      value={data.mentors.total + data.mentees.total}
                    />
                    <StatCard
                      label="Mentorship Users Active Now"
                      value={data.mentors.active + data.mentees.active}
                    />
                    <StatCard
                      label="Number of Mentees Waiting for Matching"
                      value={data.mentees.active}
                    />
                  </div>

                  {/* Growth */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">

                    {/* Day filter and pdf download */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold">GuardConnect Mentorship Growth Statistics</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
                          {DAY_OPTIONS.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setSelectedDays(d)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                selectedDays === d
                                  ? "bg-primary text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Growth cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <GrowthCard
                        label={`New Mentors (Last ${selectedDays} Days)`}
                        newCount={data.growth.newMentors}
                        changePercent={data.growth.mentorChangePercent}
                        days={selectedDays}
                      />
                      <GrowthCard
                        label={`New Mentees (Last ${selectedDays} Days)`}
                        newCount={data.growth.newMentees}
                        changePercent={data.growth.menteeChangePercent}
                        days={selectedDays}
                      />
                      <StatCard
                        label={`Active Mentorship Pairs (Last ${selectedDays} Days)`}
                        value={data.matches.acceptedThisPeriod}
                      />
                    </div>

                  {/* Enrollment chart */}
                  <div>
                      <p className="text-sm font-semibold mb-3">
                        Program Enrollment (Last {selectedDays} Days)
                      </p>
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
                            interval={Math.floor(selectedDays / 6)}
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          {/* Tooltip that removes space before rechart colon */}
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px" }}>
                                  <p style={{ fontSize: 12, marginBottom: 4 }}>{label ? new Date(String(label)).toLocaleDateString() : ""}</p>
                                  {payload.map((entry) => (
                                    <p key={String(entry.dataKey)} style={{ fontSize: 12, color: entry.color, margin: "2px 0" }}>
                                      {entry.dataKey === "mentors" ? "Mentors" : "Mentees"}: {entry.value}
                                    </p>
                                  ))}
                                </div>
                              );
                            }}
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
              </div>
              )}
            </section>
          </div>
        </TitleShell>
      </NavigationShell>
    </AuthGuard>
  );
}
