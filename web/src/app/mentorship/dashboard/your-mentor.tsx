"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { CollapsibleCardProps } from "@/components/expanding-card";
import CollapsibleCard from "@/components/expanding-card";
import ListView, { type MentorListViewItem } from "@/components/list-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTRPC } from "@/lib/trpc";

// Infer the return type from tRPC
type MentorshipData = Awaited<
  ReturnType<ReturnType<typeof useTRPC>["mentor"]["MentorshipDataOutput"]>
>;

export default function YourMentorSection() {
  const trpc = useTRPC();
  const { data: mentorshipData, isLoading } = useQuery<MentorshipData>(
    trpc.mentor.getMentorshipData.queryOptions(),
  );

  console.log(mentorshipData);

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

  // User hasn't completed mentee application
  if (!mentorshipData?.mentee) {
    return (
      <Card className="flex flex-col items-center">
        <div className="font-medium italic">
          You have not applied to be a mentee.
        </div>
        <Link href={"/mentorship/apply/mentee"}>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="inline-flex items-center gap-1"
          >
            <span>Apply to be a</span>
            <span className="font-semibold">Mentee</span>
          </Button>
        </Link>
      </Card>
    );
  }

  const hasSuggestions =
    mentorshipData.suggestedMentors &&
    mentorshipData.suggestedMentors.length > 0;
  const hasMatches =
    mentorshipData.matchedMentors && mentorshipData.matchedMentors.length > 0;

  // User is a mentor but has no pending requests or matches
  if (!hasSuggestions && !hasMatches) {
    return (
      <Card className="flex flex-col items-center">
        <div className="font-medium italic">
          No mentor suggestions available at this time.
        </div>
      </Card>
    );
  }

  // Case 3: User has mentee profile but no accepted matches - show suggested mentors
  if (hasSuggestions) {
    const suggestedMentors: MentorListViewItem[] = Array.isArray(
      mentorshipData?.suggestedMentors,
    )
      ? mentorshipData.suggestedMentors.map((item: any) => ({
          id: item.mentor.userId,
          name: `Name here`,
          personalInterests: item.mentor.personalInterests || "",
          whyInterested: item.mentor.whyInterested || "",
          careerAdvice: item.mentor.careerAdvice || "",
          preferredMeetingFormat: item.preferredMeetingFormat || "",
          hoursPerMonthCommitment: item.hoursPerMonthCommitment || "",
          hasRequested: item.hasRequested,
        }))
      : [];

    const renderSuggestedMentorRowOptions = (
      _mentorInformation: MentorListViewItem,
    ) => {
      const requested = true;
      return (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className={`inline-flex items-center gap-1 disabled:opacity-100 ${
            requested
              ? "bg-primary text-white border-primary cursor-not-allowed hover:bg-primary"
              : ""
          }`}
          disabled={requested}
        >
          {requested ? "Requested" : "Send Request"}
        </Button>
      );
    };

    const renderSuggestedMentorModal = (mentor: MentorListViewItem) => {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-secondary/70">
              Meeting Format
            </p>
            <p className="font-semibold">{mentor.meetingFormat}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary/70">
              Expected Commitment
            </p>
            <p className="font-semibold">
              {mentor.expectedCommitment} hours/month
            </p>
          </div>
          {mentor.personalInterests && mentor.personalInterests.length > 0 && (
            <div>
              <p className="text-sm font-medium text-secondary/70">
                Personal Interests
              </p>
              <p className="font-semibold">
                {mentor.personalInterests.join(", ")}
              </p>
            </div>
          )}
          {mentor.careerAdvice && (
            <div>
              <p className="text-sm font-medium text-secondary/70">
                Career Advice
              </p>
              <p className="font-semibold">{mentor.careerAdvice}</p>
            </div>
          )}
        </div>
      );
    };

    return (
      <ListView
        title="Suggested Mentors"
        items={suggestedMentors}
        rowOptions={renderSuggestedMentorRowOptions}
        modalContent={renderSuggestedMentorModal}
      />
    );
  }

  // User has matched mentors
  if (hasMatches) {
    const matchedMentors: CollapsibleCardProps[] = Array.isArray(
      mentorshipData?.matchedMentors,
    )
      ? mentorshipData.matchedMentors.map((item: any) => ({
          name: "Name here",
          rank: "Rank here",
          job: "Role here",
          location: "Location here",
          personalInterests: item.mentor.personalInterests || "",
          information: item.mentor.hopeToGainResponses || "",
          contact: "Contact info here",
        }))
      : [];

    return (
      <>
        {matchedMentors.map((mentor: any) => (
          <CollapsibleCard key={mentor.matchId} {...mentor} />
        ))}
      </>
    );
  }
}
