"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { icons } from "@/components/icons";
import { TitleShell } from "@/components/layouts/title-shell";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { authClient } from "@/lib/auth-client";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

type AvatarStatus = "idle" | "uploading" | "uploaded" | "error";

type SessionUserWithRoles = {
  roleKeys?: string[];
  roles?: string[];
};

type UserProfileExtras = {
  location?: string | null;
  about?: string | null;
  interests?: string[] | null;
};

export default function ProfileEditPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const { data: sessionData } = authClient.useSession();
  const userId = sessionData?.user.id ?? null;

  const LockIcon = icons.lock;

  const sessionUser = sessionData?.user as SessionUserWithRoles | undefined;

  const isAdmin = Boolean(
    sessionUser?.roleKeys?.includes?.("global:admin") ||
      sessionUser?.roles?.includes?.("admin"),
  );

  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [branch, setBranch] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [signalNumber, setSignalNumber] = useState("");
  const [interestsRaw, setInterestsRaw] = useState("");
  const [about, setAbout] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>("idle");
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["current-user-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is missing");
      }
      return trpcClient.user.getUserData.query({ user_id: userId });
    },
  });

  useEffect(() => {
    if (!userData) return;

    const profile = userData as UserProfileExtras;

    setName(userData.name ?? "");
    setEmail(userData.email ?? "");
    setRank(userData.rank ?? "");
    setBranch(userData.branch ?? "");
    setUnit(userData.department ?? "");
    setSignalNumber(userData.phoneNumber ?? "");
    setAvatarFileId(userData.image ?? null);

    setLocation(profile.location ?? "");
    setAbout(profile.about ?? "");

    if (Array.isArray(profile.interests)) {
      setInterestsRaw(profile.interests.join(", "));
    }
  }, [userData]);

  const interests = useMemo(
    () =>
      interestsRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [interestsRaw],
  );

  type UpdateUserProfileVars = {
    name?: string;
    phoneNumber?: string | null;
    rank?: string | null;
    department?: string | null;
    branch?: string | null;
    image?: string | null;
    location?: string | null;
    about?: string | null;
    interests?: string[] | null;
  };

  type UpdateUserProfileMutationOptions = ReturnType<
    typeof trpc.user.updateUserProfile.mutationOptions
  >;

  type UpdateUserProfileError = Parameters<
    NonNullable<UpdateUserProfileMutationOptions["onError"]>
  >[0];

  type UpdateUserProfileData = Parameters<
    NonNullable<UpdateUserProfileMutationOptions["onSuccess"]>
  >[0];

  const updateUserProfile = useMutation<
    UpdateUserProfileData,
    UpdateUserProfileError,
    UpdateUserProfileVars
  >(trpc.user.updateUserProfile.mutationOptions());

  const isSaving = updateUserProfile.isPending;

  const uploadAvatar = useCallback(
    async (file: File) => {
      setAvatarStatus("uploading");
      setPhotoError(null);

      try {
        const presign = await trpcClient.files.createPresignedUpload.mutate({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        const uploadResponse = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed. Please try again.");
        }

        await trpcClient.files.confirmUpload.mutate({
          fileId: presign.fileId,
          fileName: file.name,
          storedName: presign.storedName,
          contentType: file.type || undefined,
        });

        setAvatarFileId(presign.fileId);
        setAvatarStatus("uploaded");
      } catch (error) {
        setAvatarStatus("error");
        setAvatarFileId(null);
        setPhotoError(
          error instanceof Error
            ? error.message
            : "Something went wrong uploading your profile photo.",
        );
      }
    },
    [trpcClient],
  );

  const handlePhotoDrop = useCallback(
    (acceptedFiles: File[]) => {
      setPhotoError(null);

      if (!acceptedFiles.length) return;

      const [file] = acceptedFiles;

      if (!file.type.startsWith("image/")) {
        setPhotoError("Please upload an image file.");
        setPhotoFile(null);
        setAvatarPreviewUrl(null);
        setAvatarFileId(null);
        setAvatarStatus("error");
        return;
      }

      setPhotoFile(file);

      const objectUrl = URL.createObjectURL(file);
      setAvatarPreviewUrl(objectUrl);

      void uploadAvatar(file);
    },
    [uploadAvatar],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (avatarStatus === "uploading") {
      toast.info("Please wait for your profile photo to finish uploading.");
      return;
    }

    if (avatarStatus === "error") {
      toast.error("Please fix the profile photo upload error or remove it.");
      return;
    }

    const payload: UpdateUserProfileVars = {
      name,
      phoneNumber: signalNumber || null,
      department: unit || null,
      rank: rank || null,
      branch: branch || null,
      image: avatarFileId ?? null,
      location: location || null,
      about: about || null,
      interests: interests.length ? interests : null,
    };

    updateUserProfile.mutate(payload, {
      async onSuccess() {
        await queryClient.invalidateQueries({
          queryKey: ["current-user-profile", userId],
        });

        toast.success("Profile updated", {
          description: "Your profile changes have been saved.",
        });
        router.push("/profile");
      },
      onError(error) {
        toast.error("Unable to update profile", {
          description: error.message,
        });
      },
    });
  };

  if (!userId) {
    return (
      <TitleShell
        title="Edit profile"
        backHref="/profile"
        backAriaLabel="Back to profile"
      >
        <p className="text-body text-secondary/80">
          You must be signed in to edit your profile.
        </p>
      </TitleShell>
    );
  }

  if (isLoading && !userData) {
    return (
      <TitleShell
        title="Edit profile"
        backHref="/profile"
        backAriaLabel="Back to profile"
      >
        <p className="text-body text-secondary/80">Loading profile…</p>
      </TitleShell>
    );
  }

  if (isError || !userData) {
    return (
      <TitleShell
        title="Edit profile"
        backHref="/profile"
        backAriaLabel="Back to profile"
      >
        <p className="text-body text-destructive">
          Something went wrong loading your profile.
        </p>
      </TitleShell>
    );
  }

  return (
    <TitleShell
      title="Edit profile"
      backHref="/profile"
      backAriaLabel="Back to profile"
    >
      <div className="flex justify-center px-4 sm:px-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl space-y-6 rounded-3xl border border-neutral/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-7"
        >
          <div className="space-y-3">
            <p className="text-subheader font-semibold text-secondary">
              Profile photo
            </p>
            <Dropzone
              onDrop={handlePhotoDrop}
              onError={(error) => setPhotoError(error.message)}
              src={photoFile ? [photoFile] : []}
              maxFiles={1}
              disabled={isSaving || avatarStatus === "uploading"}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            {avatarStatus === "uploading" && (
              <p className="text-xs text-secondary/70">Uploading photo…</p>
            )}
            {avatarStatus === "uploaded" && (
              <p className="text-xs text-primary">Photo ready to save.</p>
            )}
            {photoError && (
              <p className="text-sm text-destructive">{photoError}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-subheader font-semibold text-secondary"
              >
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rank"
                className="text-subheader font-semibold text-secondary"
              >
                Rank
              </label>

              <div
                className={
                  isAdmin
                    ? "flex items-center gap-2 rounded-xl border border-neutral/60 bg-white px-3 py-2"
                    : "flex items-center gap-2 rounded-xl border border-neutral bg-neutral/20 px-3 py-2"
                }
              >
                <input
                  id="rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  disabled={!isAdmin || isSaving}
                  className="flex-1 bg-transparent border-none p-0 text-body text-secondary outline-none"
                />
                {!isAdmin && <LockIcon className="h-4 w-4 text-accent" />}
              </div>
              {!isAdmin && (
                <p className="text-xs text-secondary/70">
                  Contact an administrator to change your rank.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="branch"
                className="text-subheader font-semibold text-secondary"
              >
                Branch
              </label>

              <div
                className={
                  isAdmin
                    ? "flex items-center gap-2 rounded-xl border border-neutral/60 bg-white px-3 py-2"
                    : "flex items-center gap-2 rounded-xl border border-neutral bg-neutral/20 px-3 py-2"
                }
              >
                <input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={!isAdmin || isSaving}
                  className="flex-1 bg-transparent border-none p-0 text-body text-secondary outline-none"
                />
                {!isAdmin && <LockIcon className="h-4 w-4 text-accent" />}
              </div>
              {!isAdmin && (
                <p className="text-xs text-secondary/70">
                  Contact an administrator to change your branch.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="unit"
                className="text-subheader font-semibold text-secondary"
              >
                Unit
              </label>
              <input
                id="unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-subheader font-semibold text-secondary"
              >
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-subheader font-semibold text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="signalNumber"
                className="text-subheader font-semibold text-secondary"
              >
                Signal number
              </label>
              <input
                id="signalNumber"
                value={signalNumber}
                onChange={(event) => setSignalNumber(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="interests"
                className="text-subheader font-semibold text-secondary"
              >
                Interests
              </label>
              <input
                id="interests"
                value={interestsRaw}
                onChange={(event) => setInterestsRaw(event.target.value)}
                disabled={isSaving}
                className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="text-xs text-secondary/70">
                Separate interests with commas. These appear as badges on your
                profile.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="about"
              className="text-subheader font-semibold text-secondary"
            >
              About
            </label>
            <textarea
              id="about"
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              rows={4}
              disabled={isSaving}
              className="block w-full rounded-xl border border-neutral/60 bg-white px-3 py-2 text-body text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={isSaving || avatarStatus === "uploading"}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              asChild
              className="text-secondary"
              disabled={isSaving}
            >
              <a href="/profile">Cancel</a>
            </Button>
          </div>
        </form>
      </div>
    </TitleShell>
  );
}
