"use client";

import { mentorshipResources } from "@/app/mentorship/dashboard/resources";
import YourMenteeSection from "@/app/mentorship/dashboard/your-mentee";
import YourMentorSection from "@/app/mentorship/dashboard/your-mentor";
import { TitleShell } from "@/components/layouts/title-shell";
import LinkedCard from "@/components/linked-card";

export default function MentorshipDashboard() {
  return (
    <TitleShell
      title={
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem] font-semibold leading-tight text-secondary sm:text-[2.25rem]">
            Mentorship Dashboard
          </h1>
        </div>
      }
      scrollableContent={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <div className="mb-10">
            <h1 className="text-2xl text-header font-semibold mb-5">
              Your Mentor
            </h1>
            <YourMentorSection />
          </div>
          <h1 className="text-2xl text-header font-semibold mb-5">
            Your Mentee
          </h1>
          <YourMenteeSection />
        </div>
        <div className="flex flex-col">
          <div className="text-2xl text-header font-semibold mb-5">
            Resources
          </div>
          <div className="flex flex-col gap-3">
            {mentorshipResources.map((resource) => (
              <LinkedCard href={resource.link} key={resource.link}>
                <div>
                  <h1>{resource.title}</h1>
                  <h2 className="font-medium italic">{resource.author}</h2>
                </div>
              </LinkedCard>
            ))}
          </div>
        </div>
      </div>
    </TitleShell>
  );
}
