"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { locationOptions } from "@/app/login/create-account/MA-towns";
import {
  airForceRanks,
  armyRanks,
} from "@/app/login/create-account/rankOptions";
import { SingleSelectButtonGroup } from "@/components/button-single-select";
import { DropdownSelect } from "@/components/dropdown-select";
import { MultiSelect, type MultiSelectOption } from "@/components/multi-select";
import TextInput from "@/components/text-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useTRPCClient } from "@/lib/trpc";

const InterestOptions: MultiSelectOption[] = [
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

const rankOptions = [
  {
    label: "Army National Guard",
    value: "army-national-guard",
    dropdownOptions: armyRanks,
  },
  {
    label: "Air Force National Guard",
    value: "air-force-national-guard",
    dropdownOptions: airForceRanks,
  },
];

function CreateAccountPage() {
  const router = useRouter();
  const trpc = useTRPCClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullname, setFullname] = useState("");

  const [branch, setBranch] = useState<
    "army-national-guard" | "air-force-national-guard" | null
  >(null);
  const [department, setDepartment] = useState<string>("");
  const [rankSelection, setRankSelection] = useState<string>("");
  const [multiLineText, setMultiLineText] = useState<string>("");
  const [locationSelection, setLocationSelection] = useState<string>("");
  const [careerField, setCareerField] = useState<string>("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dutySelection, setDutySelection] = useState<
    "active-duty" | "part-time" | null
  >(null);
  const [signalVisibility, setSignalVisibility] = useState<
    "private" | "public"
  >("private");
  const [emailVisibility, setEmailVisibility] = useState<"private" | "public">(
    "private",
  );

  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const [dutyError, setDutyError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSubmitting) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const handleCreateAccount = async () => {
    setDutyError(null);
    setEmailError(null);
    setPasswordError(null);
    setBioError(null);
    setBranchError(null);
    setSubmitError(null);

    if (!inviteCode) {
      setSubmitError(
        "Invite code is missing. Please return to the sign-up page and try again.",
      );
      return;
    }

    if (!dutySelection) {
      setDutyError("Please select whether you are active duty or part-time.");
      return;
    }

    if (!email) {
      setEmailError("Email is required.");
      return;
    }

    if (!password) {
      setPasswordError("Password is required.");
      return;
    }

    if (!multiLineText) {
      setBioError("Short biography is required.");
      return;
    }

    if (!fullname.trim()) {
      setSubmitError("Full name is required.");
      return;
    }

    if (!locationSelection.trim()) {
      setSubmitError("Location is required.");
      return;
    }

    if (!department.trim()) {
      setSubmitError("Department is required.");
      return;
    }

    if (!branch) {
      setBranchError("Branch is required");
      return;
    }

    if (!rankSelection) {
      setBranchError("Rank is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signOutError } = await authClient.signOut();
      if (signOutError) {
        throw new Error(
          signOutError.message ?? "Unable to prepare account setup.",
        );
      }

      await trpc.user.createUser.mutate({
        inviteCode,
        userData: {
          email,
          password,
          name: fullname.trim(),
          phoneNumber: phone.trim() ? phone.trim() : undefined,
          rank: rankSelection,
          about: multiLineText.trim(),
          location: locationSelection.trim(),
          positionType:
            dutySelection === "active-duty" ? "active" : "part-time",
          branch: branch === "air-force-national-guard" ? "airforce" : "army",
          department: department.trim(),
          civilianCareer: careerField.trim(),

          emailVisibility,
          signalVisibility,

          interests: selectedInterests,

          linkedinVisibility: "public",
        },
      });

      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        throw new Error(
          error.message ?? "Unable to sign in to the new account.",
        );
      } else {
        router.replace("/communications");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Account creation failed.";
      if (message.includes("already been used")) {
        setSubmitError(
          "This invite code has already been used. If your account already exists, please sign in.",
        );
        return;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-start px-6 py-16 sm:gap-0 sm:px-10 lg:px-16">
      <h1 className="text-3xl font-semibold text-secondary sm:text-4xl lg:text-3xl mb-3">
        Create Your Account
      </h1>
      <h1 className="text-left text-md font-medium text-secondary mb-1">
        Please fill out the following information to create your account.
      </h1>
      <h1 className="text-s sm:text-sm text-accent mb-6">
        *Required Information
      </h1>

      <div className="flex-1 max-w-lg space-y-6">
        <label htmlFor="login-fullname">Full Name*</label>
        <TextInput
          id="login-fullname"
          name="fullname"
          placeholder="Your full name"
          value={fullname}
          className="w-full mt-2"
          onChange={setFullname}
        />

        <label htmlFor="login-email">Email address*</label>
        <TextInput
          id="login-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          className="w-full mt-2"
          onChange={(value) => {
            setEmail(value);
            setEmailError(null);
            setSubmitError(null);
          }}
        />
        {emailError && <p className="mt-1 text-xs text-error">{emailError}</p>}

        <label htmlFor="login-password">Password*</label>
        <TextInput
          id="login-password"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          className="w-full mt-2"
          onChange={(value) => {
            setPassword(value);
            setPasswordError(null);
            setSubmitError(null);
          }}
        />
        {passwordError && (
          <p className="mt-1 text-xs text-error">{passwordError}</p>
        )}

        <label htmlFor="login-phone">
          Phone Number{" "}
          <span className="font-regular text-accent">(Not Required)</span>
        </label>
        <TextInput
          id="login-phone"
          name="phone"
          placeholder="(123) 456-7890"
          value={phone}
          className="w-full mt-2"
          onChange={(value) => {
            setPhone(value);
            setSubmitError(null);
          }}
        />

        <label htmlFor="login-location">Location*</label>
        <DropdownSelect
          options={locationOptions}
          value={locationSelection}
          onChange={(value) => {
            setLocationSelection(value);
            setSubmitError(null);
          }}
          className="w-full mt-2"
        />

        <label htmlFor="login-rank">What is your rank?*</label>
        <SingleSelectButtonGroup
          options={rankOptions}
          value={branch ?? ""}
          onChange={(val) => {
            setBranch(
              val as "army-national-guard" | "air-force-national-guard",
            );
            setBranchError(null);
            setSubmitError(null);
          }}
          onDropdownChange={(branch, rank) => {
            setBranch(
              branch as "army-national-guard" | "air-force-national-guard",
            );
            setRankSelection(rank);
            setBranchError(null);
            setSubmitError(null);
          }}
          className="w-full mt-2"
        />
        {branchError && (
          <p className="mt-1 text-xs text-error">{branchError}</p>
        )}

        <label htmlFor="login-dept">What is your department?*</label>
        <TextInput
          id="login-dept"
          name="dept"
          placeholder="Your department"
          value={department}
          className="w-full mt-2"
          onChange={(value) => {
            setDepartment(value);
            setSubmitError(null);
          }}
        />

        <label htmlFor="login-career-field">What is your career field?</label>
        <TextInput
          id="login-career-field"
          name="careerField"
          placeholder="Your career field"
          value={careerField}
          className="w-full mt-2"
          onChange={(value) => {
            setCareerField(value);
            setSubmitError(null);
          }}
        />

        <label htmlFor="login-duty-status">
          Are you active duty or part-time?*
        </label>
        <SingleSelectButtonGroup
          options={[
            { label: "Active Duty", value: "active-duty" },
            { label: "Part-time", value: "part-time" },
          ]}
          value={dutySelection ?? ""}
          onChange={(value) => {
            setDutySelection(value as "active-duty" | "part-time" | null);
            setDutyError(null);
            setSubmitError(null);
          }}
        />
        {dutyError && <p className="mt-1 text-xs text-error">{dutyError}</p>}

        <label htmlFor="login-biography">Short Biography*</label>
        <TextInput
          value={multiLineText}
          onChange={(value) => {
            setMultiLineText(value);
            setBioError(null);
            setSubmitError(null);
          }}
          placeholder="Enter a short biography about yourself..."
          multiline={true}
          rows={5}
          maxLength={500}
          showCharCount={true}
          className="border-primary mt-2"
          counterColor="text-primary"
        />
        {bioError && <p className="mt-1 text-xs text-error">{bioError}</p>}

        <label //selected here will appear selected in "interests" section of mentee/mentor forms
          htmlFor="login-interests"
        >
          Areas of Interest
        </label>
        <MultiSelect
          name="mentorInterests"
          helperText=" "
          options={InterestOptions}
          value={selectedInterests}
          onChange={(value) => {
            setSelectedInterests(value);
            setSubmitError(null);
          }}
          maxSelections={9}
        />

        <div className="flex-1 max-w-xl space-y-6">
          <div className="space-y-2">
            <p>Signal Visiblity</p>
            <Select
              value={signalVisibility}
              onValueChange={(value) => {
                setSignalVisibility(value as "private" | "public");
                setSubmitError(null);
              }}
            >
              <SelectTrigger
                id="signal-visibility"
                className="w-full sm:min-w-64"
              >
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Visible to only me</SelectItem>
                <SelectItem value="public">Visible to anyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p>Email Visibility</p>
            <Select
              value={emailVisibility}
              onValueChange={(value) => {
                setEmailVisibility(value as "private" | "public");
                setSubmitError(null);
              }}
            >
              <SelectTrigger
                id="email-visibility"
                className="w-full sm:min-w-64"
              >
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Visible to only me</SelectItem>
                <SelectItem value="public">Visible to anyone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-xl mt-5">
        {submitError && (
          <p className="mb-2 text-sm text-error">{submitError}</p>
        )}
        <Button
          type="button"
          className="inline-flex items-center gap-2 px-6"
          disabled={isSubmitting}
          onClick={handleCreateAccount}
          aria-label="Create a new account"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full py-16">
          <span className="animate-spin mr-2 w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full inline-block"></span>
          Loading...
        </div>
      }
    >
      <CreateAccountPage />
    </Suspense>
  );
}
