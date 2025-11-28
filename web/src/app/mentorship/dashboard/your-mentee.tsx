"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { CollapsibleCardProps } from "@/components/expanding-card";
import CollapsibleCard from "@/components/expanding-card";
import { icons } from "@/components/icons";
import ListView, { type MenteeListViewItem } from "@/components/list-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTRPC } from "@/lib/trpc";

// Infer the return type from tRPC
type MentorshipData = Awaited<
  ReturnType<ReturnType<typeof useTRPC>["mentor"]["MentorshipDataOutput"]>
>;

export default function YourMenteeSection() {
  const AcceptIcon = icons.done;
  const RejectIcon = icons.clear;

  const trpc = useTRPC();
  const { data: mentorshipData, isLoading } = useQuery<MentorshipData>(
    trpc.mentor.getMentorshipData.queryOptions(),
  );

  const renderMenteeRequestRowOptions = () => {
    return (
      <div className="flex items-center gap-2">
        {/* TODO: connect with BE matching service */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-primary hover:bg-primary group"
        >
          <AcceptIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
        </Button>
        {/* TODO: connect with BE matching service */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-accent"
        >
          <RejectIcon className="h-5 w-5 text-accent" />
        </Button>
      </div>
    );
  };

  const renderMenteeRequestModal = (mentee: MenteeListViewItem) => {
    return (
      <div className="space-y-4">
        {mentee.preferredMeetingFormat && (
          <div>
            <p className="text-sm font-medium text-secondary/70">
              What is your preferred meeting format?
            </p>
            <p className="font-semibold">{mentee.preferredMeetingFormat}</p>
          </div>
        )}
        {mentee.hoursPerMonthCommitment && (
          <div>
            <p className="text-sm font-medium text-secondary/70">
              What is your expected commitment?
            </p>
            <p className="font-semibold">
              {mentee.hoursPerMonthCommitment} hours/month
            </p>
          </div>
        )}
        {mentee.personalInterests && (
          <div>
            <p className="text-sm font-medium text-secondary/70">
              What are your personal interests?
            </p>
            <p className="font-semibold">{mentee.personalInterests}</p>
          </div>
        )}
        {mentee.roleModelInspiration && (
          <div>
            <p className="text-sm font-medium text-secondary/70">
              Who is a role model or inspiration for you?
            </p>
            <p className="font-semibold">{mentee.roleModelInspiration}</p>
          </div>
        )}
        {mentee.hopeToGainResponses &&
          mentee.hopeToGainResponses.length > 0 && (
            <div>
              <p className="text-sm font-medium text-secondary/70">
                What do you hope to gain from the mentorship program?
              </p>
              <p className="font-semibold">{mentee.hopeToGainResponses}</p>
            </div>
          )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <Card className="flex flex-col items-center">
          <div className="font-medium italic text-center px-6 py-4">
            Loading...
          </div>
        </Card>
      </div>
    );
  }

  // User hasn't completed mentor application
  if (!mentorshipData?.mentor) {
    return (
      <div>
        <Card className="flex flex-col items-center">
          <div className="font-medium italic">
            You have not applied to be a mentor.
          </div>
          <Link href={"/mentorship/apply/mentor"}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="inline-flex items-center gap-1"
            >
              <span>Apply to be a</span>
              <span className="font-semibold">Mentor</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const hasPendingRequests =
    mentorshipData.pendingMenteeRequests &&
    mentorshipData.pendingMenteeRequests.length > 0;
  const hasMatchedMentees =
    mentorshipData.matchedMentees && mentorshipData.matchedMentees.length > 0;

  // User is a mentor but has no pending requests or matches
  if (!hasPendingRequests && !hasMatchedMentees) {
    return (
      <div>
        <Card className="flex flex-col items-center">
          <div className="font-medium italic text-center px-6 py-4">
            No mentee requests or matches at this time.
          </div>
        </Card>
      </div>
    );
  }

  console.log("pendingMenteeRequests:", mentorshipData?.pendingMenteeRequests);

  const pendingRequests: MenteeListViewItem[] = Array.isArray(
    mentorshipData?.pendingMenteeRequests,
  )
    ? mentorshipData.pendingMenteeRequests.map((item: any) => ({
        id: item.mentee.userId,
        name: `Name here`,
        learningGoals: item.mentee.learningGoals,
        experienceLevel: item.mentee.experienceLevel,
        preferredMentorType: item.mentee.preferredMentorType,
        resumeFileId: item.mentee.resumeFileId,
        personalInterests: item.mentee.personalInterests,
        roleModelInspiration: item.mentee.roleModelInspiration,
        hopeToGainResponses: item.mentee.hopeToGainResponses,
        mentorQualities: item.mentee.mentorQualities,
        preferredMeetingFormat: item.mentee.preferredMeetingFormat,
        hoursPerMonthCommitment: item.mentee.hoursPerMonthCommitment,
      }))
    : [];

  // Transform matched mentees
  const matchedMentees: (CollapsibleCardProps & { matchId: number })[] =
    Array.isArray(mentorshipData?.matchedMentees)
      ? mentorshipData.matchedMentees.map((item: any) => ({
          name: "Name here",
          rank: "Rank here",
          job: "Role here",
          location: "Location here",
          personalInterests: item.mentee.personalInterests || "",
          information: item.mentee.hopeToGainResponses || "",
          contact: "Contact info here",
        }))
      : [];

  // Case 3: User has pending requests and/or matched mentees
  return (
    <div>
      {/* Show pending requests if they exist */}
      {hasPendingRequests && (
        <ListView
          title="Pending Requests"
          items={pendingRequests}
          modalContent={renderMenteeRequestModal}
          rowOptions={renderMenteeRequestRowOptions}
        />
      )}

      {/* Show matched mentees if they exist */}
      {hasMatchedMentees && (
        <>
          {matchedMentees.map((mentee) => (
            <CollapsibleCard key={mentee.matchId} {...mentee} />
          ))}
        </>
      )}
    </div>
  );
}
