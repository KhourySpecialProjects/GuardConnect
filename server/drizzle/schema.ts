import {
  pgTable,
  check,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  vector,
  unique,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const careerStageEnum = pgEnum("career_stage_enum", [
  "new-soldiers",
  "junior-ncos",
  "senior-ncos",
  "junior-officers",
  "senior-officers",
  "transitioning",
  "no-preference",
]);
export const channelPostPermissionEnum = pgEnum(
  "channel_post_permission_enum",
  ["admin", "everyone", "custom"],
);
export const matchStatusEnum = pgEnum("match_status_enum", [
  "pending",
  "accepted",
  "declined",
]);
export const meetingFormatEnum = pgEnum("meeting_format_enum", [
  "in-person",
  "virtual",
  "hybrid",
  "no-preference",
]);
export const menteeStatusEnum = pgEnum("mentee_status_enum", [
  "active",
  "inactive",
  "matched",
]);
export const mentorStatusEnum = pgEnum("mentor_status_enum", [
  "requested",
  "approved",
  "active",
]);
export const mentorshipUserTypeEnum = pgEnum("mentorship_user_type_enum", [
  "mentor",
  "mentee",
]);
export const messageBlastStatusEnum = pgEnum("message_blast_status_enum", [
  "draft",
  "sent",
  "failed",
]);
export const permissionEnum = pgEnum("permission_enum", [
  "read",
  "write",
  "both",
]);
export const positionTypeEnum = pgEnum("position_type_enum", [
  "active",
  "part-time",
]);
export const reportCategoryEnum = pgEnum("report_category_enum", [
  "Communication",
  "Mentorship",
  "Training",
  "Resources",
]);
export const reportStatusEnum = pgEnum("report_status_enum", [
  "Pending",
  "Assigned",
  "Resolved",
]);
export const roleNamespaceEnum = pgEnum("role_namespace_enum", [
  "global",
  "channel",
  "mentor",
  "broadcast",
  "reporting",
]);
export const serviceTypeEnum = pgEnum("service_type_enum", [
  "enlisted",
  "officer",
]);
export const visibilityEnum = pgEnum("visibility_enum", ["private", "public"]);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  () => [
    check("account_id_not_null", sql`NOT NULL id`),
    check("account_account_id_not_null", sql`NOT NULL account_id`),
    check("account_provider_id_not_null", sql`NOT NULL provider_id`),
    check("account_user_id_not_null", sql`NOT NULL user_id`),
    check("account_created_at_not_null", sql`NOT NULL created_at`),
    check("account_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const channelSubscriptions = pgTable(
  "channel_subscriptions",
  {
    subscriptionId: integer("subscription_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "channel_subscriptions_subscription_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    userId: text("user_id").notNull(),
    channelId: integer("channel_id").notNull(),
    notificationsEnabled: boolean("notifications_enabled")
      .default(true)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      "channel_subscriptions_subscription_id_not_null",
      sql`NOT NULL subscription_id`,
    ),
    check("channel_subscriptions_user_id_not_null", sql`NOT NULL user_id`),
    check(
      "channel_subscriptions_channel_id_not_null",
      sql`NOT NULL channel_id`,
    ),
    check(
      "channel_subscriptions_notifications_enabled_not_null",
      sql`NOT NULL notifications_enabled`,
    ),
    check(
      "channel_subscriptions_created_at_not_null",
      sql`NOT NULL created_at`,
    ),
  ],
);

export const channels = pgTable(
  "channels",
  {
    channelId: integer("channel_id").primaryKey().generatedAlwaysAsIdentity({
      name: "channels_channel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    metadata: jsonb(),
    postPermissionLevel: channelPostPermissionEnum("post_permission_level")
      .default("admin")
      .notNull(),
  },
  () => [
    check("channels_channel_id_not_null", sql`NOT NULL channel_id`),
    check("channels_name_not_null", sql`NOT NULL name`),
    check("channels_created_at_not_null", sql`NOT NULL created_at`),
    check(
      "channels_post_permission_level_not_null",
      sql`NOT NULL post_permission_level`,
    ),
  ],
);

export const files = pgTable(
  "files",
  {
    fileId: uuid("file_id").defaultRandom().primaryKey().notNull(),
    fileName: text("file_name").notNull(),
    location: text().notNull(),
    metadata: jsonb(),
  },
  () => [
    check("files_file_id_not_null", sql`NOT NULL file_id`),
    check("files_file_name_not_null", sql`NOT NULL file_name`),
    check("files_location_not_null", sql`NOT NULL location`),
  ],
);

export const inviteCodes = pgTable(
  "invite_codes",
  {
    codeId: integer("code_id").primaryKey().generatedAlwaysAsIdentity({
      name: "invite_codes_code_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    code: text().notNull(),
    roleKeys: jsonb("role_keys").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    usedBy: text("used_by"),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
    revokedBy: text("revoked_by"),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
  },
  () => [
    check("invite_codes_code_id_not_null", sql`NOT NULL code_id`),
    check("invite_codes_code_not_null", sql`NOT NULL code`),
    check("invite_codes_role_keys_not_null", sql`NOT NULL role_keys`),
    check("invite_codes_created_by_not_null", sql`NOT NULL created_by`),
    check("invite_codes_created_at_not_null", sql`NOT NULL created_at`),
    check("invite_codes_expires_at_not_null", sql`NOT NULL expires_at`),
  ],
);

export const mentees = pgTable(
  "mentees",
  {
    menteeId: integer("mentee_id").primaryKey().generatedAlwaysAsIdentity({
      name: "mentees_mentee_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    userId: text("user_id").notNull(),
    learningGoals: text("learning_goals"),
    experienceLevel: text("experience_level"),
    preferredMentorType: text("preferred_mentor_type"),
    status: menteeStatusEnum().default("active").notNull(),
    resumeFileId: uuid("resume_file_id"),
    personalInterests: text("personal_interests"),
    roleModelInspiration: text("role_model_inspiration"),
    hopeToGainResponses: jsonb("hope_to_gain_responses"),
    mentorQualities: jsonb("mentor_qualities"),
    preferredMeetingFormat: meetingFormatEnum("preferred_meeting_format"),
    hoursPerMonthCommitment: integer("hours_per_month_commitment"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("mentees_mentee_id_not_null", sql`NOT NULL mentee_id`),
    check("mentees_user_id_not_null", sql`NOT NULL user_id`),
    check("mentees_status_not_null", sql`NOT NULL status`),
    check("mentees_created_at_not_null", sql`NOT NULL created_at`),
    check("mentees_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const mentorRecommendations = pgTable(
  "mentor_recommendations",
  {
    recommendationId: integer("recommendation_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "mentor_recommendations_recommendation_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    userId: text("user_id").notNull(),
    recommendedMentorIds: jsonb("recommended_mentor_ids").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
  },
  () => [
    check(
      "mentor_recommendations_recommendation_id_not_null",
      sql`NOT NULL recommendation_id`,
    ),
    check("mentor_recommendations_user_id_not_null", sql`NOT NULL user_id`),
    check(
      "mentor_recommendations_recommended_mentor_ids_not_null",
      sql`NOT NULL recommended_mentor_ids`,
    ),
    check(
      "mentor_recommendations_created_at_not_null",
      sql`NOT NULL created_at`,
    ),
  ],
);

export const mentors = pgTable(
  "mentors",
  {
    mentorId: integer("mentor_id").primaryKey().generatedAlwaysAsIdentity({
      name: "mentors_mentor_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    userId: text("user_id").notNull(),
    mentorshipPreferences: text("mentorship_preferences"),
    yearsOfService: integer("years_of_service"),
    eligibilityData: jsonb("eligibility_data"),
    status: mentorStatusEnum().default("requested").notNull(),
    resumeFileId: uuid("resume_file_id"),
    strengths: jsonb().default([]),
    personalInterests: text("personal_interests"),
    whyInterestedResponses: jsonb("why_interested_responses"),
    careerAdvice: text("career_advice"),
    preferredMenteeCareerStages: jsonb("preferred_mentee_career_stages"),
    preferredMeetingFormat: meetingFormatEnum("preferred_meeting_format"),
    hoursPerMonthCommitment: integer("hours_per_month_commitment"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("mentors_mentor_id_not_null", sql`NOT NULL mentor_id`),
    check("mentors_user_id_not_null", sql`NOT NULL user_id`),
    check("mentors_status_not_null", sql`NOT NULL status`),
    check("mentors_created_at_not_null", sql`NOT NULL created_at`),
    check("mentors_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const mentorshipEmbeddings = pgTable(
  "mentorship_embeddings",
  {
    embeddingId: integer("embedding_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "mentorship_embeddings_embedding_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    userId: text("user_id").notNull(),
    userType: mentorshipUserTypeEnum("user_type").notNull(),
    whyInterestedEmbedding: vector("why_interested_embedding", {
      dimensions: 512,
    }),
    hopeToGainEmbedding: vector("hope_to_gain_embedding", { dimensions: 512 }),
    profileEmbedding: vector("profile_embedding", { dimensions: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      "mentorship_embeddings_embedding_id_not_null",
      sql`NOT NULL embedding_id`,
    ),
    check("mentorship_embeddings_user_id_not_null", sql`NOT NULL user_id`),
    check("mentorship_embeddings_user_type_not_null", sql`NOT NULL user_type`),
    check(
      "mentorship_embeddings_created_at_not_null",
      sql`NOT NULL created_at`,
    ),
    check(
      "mentorship_embeddings_updated_at_not_null",
      sql`NOT NULL updated_at`,
    ),
  ],
);

export const mentorshipMatches = pgTable(
  "mentorship_matches",
  {
    matchId: integer("match_id").primaryKey().generatedAlwaysAsIdentity({
      name: "mentorship_matches_match_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    requestorUserId: text("requestor_user_id"),
    mentorUserId: text("mentor_user_id"),
    status: matchStatusEnum().default("pending").notNull(),
    matchedAt: timestamp("matched_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    message: text(),
  },
  () => [
    check("mentorship_matches_match_id_not_null", sql`NOT NULL match_id`),
    check("mentorship_matches_status_not_null", sql`NOT NULL status`),
    check("mentorship_matches_matched_at_not_null", sql`NOT NULL matched_at`),
  ],
);

export const messageAttachments = pgTable(
  "message_attachments",
  {
    attachmentId: integer("attachment_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "message_attachments_attachment_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    messageId: integer("message_id").notNull(),
    fileId: uuid("file_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      "message_attachments_attachment_id_not_null",
      sql`NOT NULL attachment_id`,
    ),
    check("message_attachments_message_id_not_null", sql`NOT NULL message_id`),
    check("message_attachments_file_id_not_null", sql`NOT NULL file_id`),
    check("message_attachments_created_at_not_null", sql`NOT NULL created_at`),
  ],
);

export const messageBlasts = pgTable(
  "message_blasts",
  {
    blastId: integer("blast_id").primaryKey().generatedAlwaysAsIdentity({
      name: "message_blasts_blast_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    senderId: text("sender_id").notNull(),
    title: text().notNull(),
    content: text().notNull(),
    targetAudience: jsonb("target_audience"),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" }),
    validUntil: timestamp("valid_until", { withTimezone: true, mode: "string" })
      .default(sql`(now() + '24:00:00'::interval)`)
      .notNull(),
    status: messageBlastStatusEnum().default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("message_blasts_blast_id_not_null", sql`NOT NULL blast_id`),
    check("message_blasts_sender_id_not_null", sql`NOT NULL sender_id`),
    check("message_blasts_title_not_null", sql`NOT NULL title`),
    check("message_blasts_content_not_null", sql`NOT NULL content`),
    check("message_blasts_valid_until_not_null", sql`NOT NULL valid_until`),
    check("message_blasts_status_not_null", sql`NOT NULL status`),
    check("message_blasts_created_at_not_null", sql`NOT NULL created_at`),
    check("message_blasts_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const messageReactions = pgTable(
  "message_reactions",
  {
    reactionId: integer("reaction_id").primaryKey().generatedAlwaysAsIdentity({
      name: "message_reactions_reaction_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    messageId: integer("message_id").notNull(),
    userId: text("user_id").notNull(),
    emoji: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("message_reactions_reaction_id_not_null", sql`NOT NULL reaction_id`),
    check("message_reactions_message_id_not_null", sql`NOT NULL message_id`),
    check("message_reactions_user_id_not_null", sql`NOT NULL user_id`),
    check("message_reactions_emoji_not_null", sql`NOT NULL emoji`),
    check("message_reactions_created_at_not_null", sql`NOT NULL created_at`),
  ],
);

export const messages = pgTable(
  "messages",
  {
    messageId: integer("message_id").primaryKey().generatedAlwaysAsIdentity({
      name: "messages_message_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    channelId: integer("channel_id").notNull(),
    senderId: text("sender_id"),
    message: text(),
    attachmentUrl: text("attachment_url"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("messages_message_id_not_null", sql`NOT NULL message_id`),
    check("messages_channel_id_not_null", sql`NOT NULL channel_id`),
    check("messages_created_at_not_null", sql`NOT NULL created_at`),
  ],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    subscriptionId: integer("subscription_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "push_subscriptions_subscription_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    userId: text("user_id").notNull(),
    endpoint: text().notNull(),
    p256Dh: text().notNull(),
    auth: text().notNull(),
    keys: jsonb(),
    topics: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  () => [
    check(
      "push_subscriptions_subscription_id_not_null",
      sql`NOT NULL subscription_id`,
    ),
    check("push_subscriptions_user_id_not_null", sql`NOT NULL user_id`),
    check("push_subscriptions_endpoint_not_null", sql`NOT NULL endpoint`),
    check("push_subscriptions_p256dh_not_null", sql`NOT NULL p256dh`),
    check("push_subscriptions_auth_not_null", sql`NOT NULL auth`),
    check("push_subscriptions_created_at_not_null", sql`NOT NULL created_at`),
    check("push_subscriptions_is_active_not_null", sql`NOT NULL is_active`),
  ],
);

export const reportAttachments = pgTable(
  "report_attachments",
  {
    attachmentId: integer("attachment_id")
      .primaryKey()
      .generatedAlwaysAsIdentity({
        name: "report_attachments_attachment_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    reportId: uuid("report_id").notNull(),
    fileId: uuid("file_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check(
      "report_attachments_attachment_id_not_null",
      sql`NOT NULL attachment_id`,
    ),
    check("report_attachments_report_id_not_null", sql`NOT NULL report_id`),
    check("report_attachments_file_id_not_null", sql`NOT NULL file_id`),
    check("report_attachments_created_at_not_null", sql`NOT NULL created_at`),
  ],
);

export const reports = pgTable(
  "reports",
  {
    reportId: uuid("report_id").defaultRandom().primaryKey().notNull(),
    category: reportCategoryEnum(),
    title: text().notNull(),
    description: text().notNull(),
    status: reportStatusEnum().default("Pending").notNull(),
    submittedBy: text("submitted_by").notNull(),
    assignedTo: text("assigned_to"),
    assignedBy: text("assigned_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    resolved: timestamp({ withTimezone: true, mode: "string" }),
  },
  () => [
    check("reports_report_id_not_null", sql`NOT NULL report_id`),
    check("reports_title_not_null", sql`NOT NULL title`),
    check("reports_description_not_null", sql`NOT NULL description`),
    check("reports_status_not_null", sql`NOT NULL status`),
    check("reports_submitted_by_not_null", sql`NOT NULL submitted_by`),
    check("reports_created_at_not_null", sql`NOT NULL created_at`),
    check("reports_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const roles = pgTable(
  "roles",
  {
    roleId: integer("role_id").primaryKey().generatedAlwaysAsIdentity({
      name: "roles_role_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    namespace: roleNamespaceEnum().notNull(),
    subjectId: text("subject_id"),
    action: text().notNull(),
    roleKey: text("role_key").notNull(),
    channelId: integer("channel_id"),
    metadata: jsonb(),
    description: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("roles_role_id_not_null", sql`NOT NULL role_id`),
    check("roles_namespace_not_null", sql`NOT NULL namespace`),
    check("roles_action_not_null", sql`NOT NULL action`),
    check("roles_role_key_not_null", sql`NOT NULL role_key`),
    check("roles_created_at_not_null", sql`NOT NULL created_at`),
    check("roles_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    unique("session_token_unique").on(table.token),
    check("session_id_not_null", sql`NOT NULL id`),
    check("session_expires_at_not_null", sql`NOT NULL expires_at`),
    check("session_token_not_null", sql`NOT NULL token`),
    check("session_created_at_not_null", sql`NOT NULL created_at`),
    check("session_updated_at_not_null", sql`NOT NULL updated_at`),
    check("session_user_id_not_null", sql`NOT NULL user_id`),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    phoneNumber: text("phone_number"),
    image: uuid(),
    rank: text(),
    department: text(),
    branch: text(),
    positionType: positionTypeEnum("position_type"),
    location: text(),
    about: text(),
    interests: jsonb().default([]),
    civilianCareer: text("civilian_career"),
    linkedin: text(),
    signalVisibility: visibilityEnum("signal_visibility")
      .default("private")
      .notNull(),
    emailVisibility: visibilityEnum("email_visibility")
      .default("private")
      .notNull(),
    linkedinVisibility: visibilityEnum("linkedin_visibility")
      .default("public")
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("user_email_unique").on(table.email),
    check("user_id_not_null", sql`NOT NULL id`),
    check("user_name_not_null", sql`NOT NULL name`),
    check("user_email_not_null", sql`NOT NULL email`),
    check("user_email_verified_not_null", sql`NOT NULL email_verified`),
    check("user_signal_visibility_not_null", sql`NOT NULL signal_visibility`),
    check("user_email_visibility_not_null", sql`NOT NULL email_visibility`),
    check(
      "user_linkedin_visibility_not_null",
      sql`NOT NULL linkedin_visibility`,
    ),
    check("user_created_at_not_null", sql`NOT NULL created_at`),
    check("user_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  () => [
    check("verification_id_not_null", sql`NOT NULL id`),
    check("verification_identifier_not_null", sql`NOT NULL identifier`),
    check("verification_value_not_null", sql`NOT NULL value`),
    check("verification_expires_at_not_null", sql`NOT NULL expires_at`),
    check("verification_created_at_not_null", sql`NOT NULL created_at`),
    check("verification_updated_at_not_null", sql`NOT NULL updated_at`),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id").notNull(),
    roleId: integer("role_id").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    assignedBy: text("assigned_by"),
    metadata: jsonb(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
      name: "pk_user_roles",
    }),
    check("user_roles_user_id_not_null", sql`NOT NULL user_id`),
    check("user_roles_role_id_not_null", sql`NOT NULL role_id`),
    check("user_roles_assigned_at_not_null", sql`NOT NULL assigned_at`),
  ],
);
