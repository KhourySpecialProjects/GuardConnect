"use client";

import { useState } from "react";
import { SingleSelectButtonGroup } from "@/components/button-single-select";
import { SelectableButton } from "@/components/buttons";
import { DragReorderFrame } from "@/components/drag-and-drop";
import { MultiSelect, type MultiSelectOption } from "@/components/multi-select";
import { TextInput } from "@/components/text-input";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

export default function MentorshipApplyMenteePage() {
  const [positionSelection, setPositionSelection] = useState<string>("");
  const [menteeRankSelection, setMenteeRankSelection] = useState<string>("");
  const [files, setFiles] = useState<File[] | undefined>();
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const mentorInterestOptions: MultiSelectOption[] = [
    { label: "Music", value: "music" },
    { label: "Creative Arts", value: "creative-arts" },
    { label: "Outdoor Activities", value: "outdoor-activities" },
    { label: "Gaming and Entertainment", value: "gaming-and-entertainment" },
    { label: "Cooking and Baking", value: "cooking-and-baking" },
    {
      label: "Volunteering and Community Involvement",
      value: "volunteering-and-community-involvement",
    },
    { label: "DIY and Crafts", value: "diy-and-crafts" },
    { label: "Team Sports", value: "team-sports" },
    { label: "Personal Fitness", value: "personal-fitness" },
  ];

  const [multiLineText, setMultiLineText] = useState("");

  const mentorQualitiesOptions: MultiSelectOption[] = [
    { label: "Strong communicator", value: "strong-communicator" },
    {
      label: "Encouraging and empathetic",
      value: "encouraging-and-empathetic",
    },
    { label: "Experienced leader", value: "experienced-leader" },
    { label: "Creative problem-solver", value: "creative-problem-solver" },
    { label: "Honest and authentic", value: "honest-and-authentic" },
    { label: "Motivated and amibitious", value: "motivated-and-ambitious" },
    {
      label: "Open-minded and approachable",
      value: "open-minded-and-approachable",
    },
  ];

  const [selectedMeetingFormats, setSelectedMeetingFormats] = useState<
    string[]
  >([]);

  const mentorMeetingFormat: MultiSelectOption[] = [
    { label: "In-person", value: "in-person" },
    { label: "Online", value: "online" },
    { label: "No preference", value: "no-preference" },
  ];

  const [desiredMentorHours, setDesiredMentorHours] = useState("");

  return (
    <div className="overflow-hidden bg-gradient-to-br">
      {/* background gradient */}
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-yellow-600 opacity-40 blur-[120px]" />
      {/* <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[520px] w-[520px] rounded-full bg-blue-200 opacity-70 blur-[160px]" /> */}
      <div className="pointer-events-none absolute left-0 top-524 h-[420px] w-[420px] rounded-full bg-yellow-600 opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute right-70 top-280 h-[420px] w-[420px] rounded-full bg-yellow-600 opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute right-20 top-450 h-[420px] w-[420px] rounded-full bg-blue-200 opacity-70 blur-[120px]" />
      <div className="pointer-events-none absolute right-50 top-650 h-[420px] w-[420px] rounded-full bg-blue-200 opacity-70 blur-[120px]" />
      <div className="relative mx-4 flex w-full flex-col items-left justify-center sm:gap-16 px-8 sm:px-10 lg:px-20 py-10 gap-8">
        <div className="flex flex-col items-left gap-2">
          <h1 className="text-3xl font-semibold text-secondary sm:text-4xl lg:text-5xl">
            Mentee Onboarding Application
          </h1>
          <h1 className="text-left text-xs text-secondary sm:text-sm">
            Thank you for your interest in the mentorship program. Give yourself
            20-25 minutes to thoughtfully complete this application. Your
            responses will be used to suggest mentors that can support your
            personal and professional goals.
          </h1>
          <h1 className="text-left text-xs text-yellow-600 sm:text-sm">
            *Required Information
          </h1>
        </div>

        <div className="flex flex-col items-start space-y-2 -mt-4">
          <section>
            <h1 className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mb-3">
              1. What is your current position in the MA National Guard?*
            </h1>
            <SingleSelectButtonGroup
              options={[
                {
                  label: "Active Guard Reserve",
                  value: "active-guard-reserve",
                  dropdownOptions: [
                    { label: "TBD", value: "tbd" },
                    { label: "Other", value: "other" },
                  ],
                },
                {
                  label: "Enlisted",
                  value: "enlisted",
                  dropdownOptions: [
                    { label: "Squad Leader", value: "squad-leader" },
                    { label: "Platoon Sergeant", value: "platoon-sergeant" },
                    { label: "First Sergeant", value: "first-sergeant" },
                    {
                      label: "Command Sergeant Major",
                      value: "command-sergeant-major",
                    },
                    {
                      label: "Directorate Sergeant Major",
                      value: "directorate-sergeant-major",
                    },
                    {
                      label: "Group Command Chief",
                      value: "group-command-chief",
                    },
                    {
                      label: "Wing Command Chief",
                      value: "wing-command-chief",
                    },
                    { label: "Other", value: "other" },
                  ],
                },
                {
                  label: "Officer",
                  value: "officer",
                  dropdownOptions: [
                    { label: "Platoon Leader", value: "platoon-leader" },
                    {
                      label: "Company Executive Officer",
                      value: "company-executive-officer",
                    },
                    { label: "Company Commander", value: "company-commander" },
                    { label: "Battalion Staff", value: "battalion-staff" },
                    {
                      label: "Battalion Executive Officer",
                      value: "battalion-executive-officer",
                    },
                    { label: "Brigade Staff", value: "brigade-staff" },
                    {
                      label: "Brigade Executive Officer",
                      value: "brigade-executive-officer",
                    },
                    { label: "Brigade Commander", value: "brigade-commander" },
                    { label: "G-Staff", value: "g-staff" },
                    { label: "J-Staff", value: "j-staff" },
                    { label: "Other", value: "other" },
                  ],
                },
              ]}
              value={positionSelection}
              onChange={setPositionSelection}
              onDropdownChange={(parent, child) => console.log(parent, child)}
            />
          </section>

          <section>
            <h1 className="max-w-3xl mt-3 mb-3 text-left text-xs font-large text-secondary sm:text-sm">
              2. What is your current rank in the MA National Guard?*
            </h1>
            <SingleSelectButtonGroup
              options={[
                {
                  label: "Army National Guard",
                  value: "army-national-guard",
                  dropdownOptions: [
                    { label: "Private (PVT)", value: "private" },
                    {
                      label: "Private Second Class (PV2)",
                      value: "private-second",
                    },
                    {
                      label: "Private First Class (PFC)",
                      value: "private-first",
                    },
                    { label: "Specialist (SPC)", value: "specialist" },
                    { label: "Corporal (CPL)", value: "corporal" },
                    { label: "Sergeant (SGT)", value: "sergeant" },
                    { label: "Staff Sergeant (SSG)", value: "staff-sergeant" },
                    {
                      label: "Sergeant First Class (SFC)",
                      value: "sergeant-first",
                    },
                    {
                      label: "Master Sergeant (MSG)",
                      value: "master-sergeant",
                    },
                    { label: "First Sergeant (1SG)", value: "first-sergeant" },
                    { label: "Sergeant Major (SGM)", value: "sergeant-major" },
                    {
                      label: "Command Sergeant Major (CSM)",
                      value: "command-sergeant-major",
                    },
                    {
                      label: "Warrant Officer (WO1)",
                      value: "warrant-officer",
                    },
                    {
                      label: "Chief Warrant Officer 2 (CW2)",
                      value: "chief-warrant-officer-2",
                    },
                    {
                      label: "Chief Warrant Officer 3 (CW3)",
                      value: "chief-warrant-officer-3",
                    },
                    {
                      label: "Chief Warrant Officer 4 (CW4)",
                      value: "chief-warrant-officer-4",
                    },
                    {
                      label: "Chief Warrant Officer 5 (CW5)",
                      value: "chief-warrant-officer-5",
                    },
                    {
                      label: "Second Lieutenant (2LT)",
                      value: "second-lieutenant",
                    },
                    {
                      label: "First Lieutenant (1LT)",
                      value: "first-lieutenant",
                    },
                    { label: "Captain (CPT)", value: "captain" },
                    { label: "Major (MAJ)", value: "major" },
                    {
                      label: "Lieutenant Colonel (LTC)",
                      value: "lieutenant-colonel",
                    },
                    { label: "Colonel (COL)", value: "colonel" },
                    {
                      label: "Brigadier General (BG)",
                      value: "brigadier-general",
                    },
                    { label: "Major General (MG)", value: "major-general" },
                    {
                      label: "Lieutenant General (LTG)",
                      value: "lieutenant-general",
                    },
                    { label: "General (GEN)", value: "general" },
                  ],
                },
                {
                  label: "Air Force National Guard",
                  value: "air-force-national-guard",
                  dropdownOptions: [
                    { label: "Airman Basic (AB)", value: "airman-basic" },
                    { label: "Airman (Amn)", value: "airman" },
                    {
                      label: "Airman First Class (A1C)",
                      value: "airman-first",
                    },
                    { label: "Senior Airman (SrA)", value: "senior-airman" },
                    { label: "Staff Sergeant (SSgt)", value: "staff-sergeant" },
                    {
                      label: "Technical Sergeant (TSgt)",
                      value: "technical-sergeant",
                    },
                    {
                      label: "Master Sergeant (MSgt)",
                      value: "master-sergeant",
                    },
                    {
                      label: "Senior Master Sergeant (SMSgt)",
                      value: "senior-master-sergeant",
                    },
                    {
                      label: "Chief Master Sergeant (CMSgt)",
                      value: "chief-master-sergeant",
                    },
                    {
                      label: "Command Chief Master Sergeant",
                      value: "command-chief",
                    },
                    {
                      label: "Second Lieutenant (2d Lt)",
                      value: "second-lieutenant",
                    },
                    {
                      label: "First Lieutenant (1st Lt)",
                      value: "first-lieutenant",
                    },
                    { label: "Captain (Capt)", value: "captain" },
                    { label: "Major (Maj)", value: "major" },
                    {
                      label: "Lieutenant Colonel (Lt Co)",
                      value: "lieutenant-colonel",
                    },
                    { label: "Colonel (Col)", value: "colonel" },
                    {
                      label: "Brigadier General (Brig)",
                      value: "brigadier-general",
                    },
                    { label: "Major General (Maj G)", value: "major-general" },
                    {
                      label: "Lieutenant General (Lt Ge)",
                      value: "lieutenant-general",
                    },
                    { label: "General", value: "general" },
                  ],
                },
              ]}
              value={menteeRankSelection}
              onChange={setMenteeRankSelection}
              onDropdownChange={(parent, child) => console.log(parent, child)}
            />
          </section>
          <section>
            <h1 className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mb-3">
              3. Upload a resume to share with mentors once matched.
            </h1>
            <Dropzone
              className="max-w-3xl mb-3"
              onDrop={(files) => {
                setFiles(files);
              }}
              src={files}
              maxFiles={5}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </section>
          <section>
            <span className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm">
              4. What are your personal interests*{" "}
              <span className="text-yellow-600">(Select all that apply)</span>
            </span>
            <MultiSelect
              name="mentorInterests"
              helperText=" "
              options={mentorInterestOptions}
              value={selectedInterests}
              onChange={setSelectedInterests}
              maxSelections={9}
            />
          </section>
          <section>
            <div className="max-w-3xl mt-3 mb-3 text-left text-xs font-large text-secondary sm:text-sm">
              5. Who has been an important role model or source of inspiration
              for you, and why?
            </div>
            <TextInput
              value={multiLineText}
              onChange={setMultiLineText}
              placeholder="Enter your response..."
              multiline={true}
              rows={6}
              maxLength={500}
              showCharCount={true}
              className="border-primary bg-neutral-100"
              counterColor="text-primary"
            />
          </section>

          <section>
            <h1 className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mt-3 mb-3">
              6. What do you hope to get out of the mentorship program?*
              <div className="italic font-normal text-secondary sm:text-sm mt-1">
                Please rank the following reasons from top to bottom with the
                top being your most important reason and the bottom being your
                least important reason.
              </div>
            </h1>
            <DragReorderFrame
              options={[
                {
                  label:
                    "Receive guidance on my career advancement and professional goals within the National Guard (National Guard career)",
                  value: "career",
                },
                {
                  label:
                    "Get support discovering educational opportunities (Education)",
                  value: "education",
                },
                {
                  label:
                    "Develop a sense of belonging in the broader National Guard community (Community)",
                  value: "community",
                },
                {
                  label:
                    "Expand my professional network within the National Guard (Network)",
                  value: "network",
                },
                {
                  label:
                    "Connect with Guardsmen who have different perspectives and experiences (Diversity)",
                  value: "diversity",
                },
              ]}
              onChange={() => {}}
            />
          </section>

          <section>
            <span className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mb-3">
              7. What qualities do you look for in a mentor?*{" "}
              <span className="text-yellow-600">(Select up to 3)</span>
            </span>
            <MultiSelect
              name="mentorQualities"
              helperText=" "
              options={mentorQualitiesOptions}
              value={selectedQualities}
              onChange={setSelectedQualities}
              maxSelections={3}
            />
          </section>

          <section>
            <span className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mb-3">
              8. What meeting formats work best for you?*{" "}
              <span className="text-yellow-600">(Select all that apply)</span>
            </span>
            <MultiSelect
              name="mentorMeetingFormats"
              helperText=" "
              options={mentorMeetingFormat}
              value={selectedMeetingFormats}
              onChange={setSelectedMeetingFormats}
              maxSelections={3}
            />
          </section>

          <section>
            <h1 className="max-w-3xl text-left text-xs font-large text-secondary sm:text-sm mb-3 mt-3">
              9. How much time would you like to spend with your mentor?*
            </h1>
            <TextInput
              value={desiredMentorHours}
              onChange={setDesiredMentorHours}
              placeholder="Hours per Month"
              showCharCount={false}
              className="border-neutral "
              counterColor="#CDCDCD"
            />
          </section>

          <SelectableButton
            text="Submit"
            className="mt-4 mb-4 bg-yellow-600 text-white"
          />
        </div>
      </div>
    </div>
  );
}
