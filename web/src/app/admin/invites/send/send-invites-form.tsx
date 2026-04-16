"use client";

import type { RoleKey } from "@server/data/roles";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXPIRY_OPTIONS, INVITE_PRESETS, type InvitePreset } from "../types";
import { getMinimalRoleSet } from "../utils/permission-helpers";
import { PermissionTree } from "../components/permission-tree";

export type SendInvitesFormValues = {
  emails: string[];
  roleKeys: RoleKey[];
  expiresInHours: number;
};

type SendInvitesFormProps = {
  onSubmit: (values: SendInvitesFormValues) => Promise<void> | void;
  submitting?: boolean;
  error?: string | null;
};

function parseEmails(raw: string): string[] {
  return [...new Set(
    raw
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0),
  )];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SendInvitesForm({
  onSubmit,
  submitting = false,
  error = null,
}: SendInvitesFormProps) {
  const [emailsRaw, setEmailsRaw] = useState("");
  const [preset, setPreset] = useState<InvitePreset>("basic-user");
  const [selectedRoles, setSelectedRoles] = useState<Set<RoleKey>>(
    new Set(INVITE_PRESETS["basic-user"].roleKeys),
  );
  const [expiresInHours, setExpiresInHours] = useState<number>(168);

  const parsedEmails = parseEmails(emailsRaw);
  const validEmails = parsedEmails.filter((e) => EMAIL_REGEX.test(e));
  const invalidEmails = parsedEmails.filter((e) => !EMAIL_REGEX.test(e));

  const handlePresetChange = (newPreset: InvitePreset) => {
    setPreset(newPreset);
    setSelectedRoles(new Set(INVITE_PRESETS[newPreset].roleKeys));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validEmails.length === 0 || selectedRoles.size === 0) {
      return;
    }

    await onSubmit({
      emails: validEmails,
      roleKeys: getMinimalRoleSet(selectedRoles),
      expiresInHours,
    });
  };

  const isSubmitDisabled =
    submitting || validEmails.length === 0 || selectedRoles.size === 0;

  return (
    <form
      className="flex flex-col gap-4 sm:gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      {/* Email Addresses */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="invite-emails"
          className="text-sm font-medium text-secondary"
        >
          Email Addresses
        </label>
        <Textarea
          id="invite-emails"
          placeholder="Enter email addresses, one per line or comma-separated"
          value={emailsRaw}
          onChange={(e) => setEmailsRaw(e.target.value)}
          disabled={submitting}
          rows={5}
          className="resize-y font-mono text-sm"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-secondary/70">
            Separate addresses with newlines or commas. Duplicates are removed automatically.
          </p>
          {parsedEmails.length > 0 && (
            <p className="text-xs shrink-0 ml-2">
              {invalidEmails.length > 0 ? (
                <span className="text-red-600">
                  {validEmails.length} valid · {invalidEmails.length} invalid
                </span>
              ) : (
                <span className="text-green-700">
                  {validEmails.length} email{validEmails.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Preset Selection */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="invite-preset"
          className="text-sm font-medium text-secondary"
        >
          User Type Preset
        </label>
        <Select
          value={preset}
          onValueChange={(value) => handlePresetChange(value as InvitePreset)}
          disabled={submitting}
        >
          <SelectTrigger
            id="invite-preset"
            className="w-full justify-between py-3 sm:py-6 h-auto"
          >
            <SelectValue placeholder="Select a preset">
              <div className="flex flex-col items-start gap-0.5 sm:gap-1 py-0.5">
                <span className="text-sm sm:text-base font-medium">
                  {INVITE_PRESETS[preset].label}
                </span>
                <span className="hidden sm:block text-xs text-muted-foreground line-clamp-2">
                  {INVITE_PRESETS[preset].description}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-w-[calc(100vw-2rem)]">
            {Object.entries(INVITE_PRESETS).map(([key, config]) => (
              <SelectItem key={key} value={key} className="max-w-full">
                <div className="flex flex-col items-start gap-0.5 pr-2">
                  <span className="font-medium text-sm">{config.label}</span>
                  <span className="text-xs opacity-70 break-words">
                    {config.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Permission Tree */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-secondary">Permissions</h3>
        <div className="rounded-lg border border-border bg-white p-3 sm:p-4 overflow-x-auto">
          <PermissionTree
            selectedRoles={selectedRoles}
            onRolesChange={setSelectedRoles}
          />
        </div>
      </div>

      {/* Expiry Selection */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="invite-expiry"
          className="text-sm font-medium text-secondary"
        >
          Expires After
        </label>
        <Select
          value={expiresInHours.toString()}
          onValueChange={(value) => setExpiresInHours(Number(value))}
          disabled={submitting}
        >
          <SelectTrigger
            id="invite-expiry"
            className="w-full sm:w-fit sm:min-w-[10rem] justify-between"
          >
            <SelectValue placeholder="Choose duration" />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-800">{error}</p>
        </div>
      ) : null}

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <div className="text-xs text-secondary/60 self-center">
          {selectedRoles.size} permission{selectedRoles.size !== 1 ? "s" : ""} ·{" "}
          {validEmails.length} recipient{validEmails.length !== 1 ? "s" : ""}
        </div>
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full sm:w-auto"
        >
          {submitting
            ? "Sending..."
            : `Send ${validEmails.length > 0 ? validEmails.length : ""} Invite${validEmails.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </form>
  );
}
