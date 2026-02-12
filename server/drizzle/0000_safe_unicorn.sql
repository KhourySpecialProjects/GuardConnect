-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."career_stage_enum" AS ENUM('new-soldiers', 'junior-ncos', 'senior-ncos', 'junior-officers', 'senior-officers', 'transitioning', 'no-preference');--> statement-breakpoint
CREATE TYPE "public"."channel_post_permission_enum" AS ENUM('admin', 'everyone', 'custom');--> statement-breakpoint
CREATE TYPE "public"."match_status_enum" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."meeting_format_enum" AS ENUM('in-person', 'virtual', 'hybrid', 'no-preference');--> statement-breakpoint
CREATE TYPE "public"."mentee_status_enum" AS ENUM('active', 'inactive', 'matched');--> statement-breakpoint
CREATE TYPE "public"."mentor_status_enum" AS ENUM('requested', 'approved', 'active');--> statement-breakpoint
CREATE TYPE "public"."mentorship_user_type_enum" AS ENUM('mentor', 'mentee');--> statement-breakpoint
CREATE TYPE "public"."message_blast_status_enum" AS ENUM('draft', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."permission_enum" AS ENUM('read', 'write', 'both');--> statement-breakpoint
CREATE TYPE "public"."position_type_enum" AS ENUM('active', 'part-time');--> statement-breakpoint
CREATE TYPE "public"."report_category_enum" AS ENUM('Communication', 'Mentorship', 'Training', 'Resources');--> statement-breakpoint
CREATE TYPE "public"."report_status_enum" AS ENUM('Pending', 'Assigned', 'Resolved');--> statement-breakpoint
CREATE TYPE "public"."role_namespace_enum" AS ENUM('global', 'channel', 'mentor', 'broadcast', 'reporting');--> statement-breakpoint
CREATE TYPE "public"."service_type_enum" AS ENUM('enlisted', 'officer');--> statement-breakpoint
CREATE TYPE "public"."visibility_enum" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "account_id_not_null" CHECK (NOT NULL id),
	CONSTRAINT "account_account_id_not_null" CHECK (NOT NULL account_id),
	CONSTRAINT "account_provider_id_not_null" CHECK (NOT NULL provider_id),
	CONSTRAINT "account_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "account_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "account_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "channel_subscriptions" (
	"subscription_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "channel_subscriptions_subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"channel_id" integer NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "channel_subscriptions_subscription_id_not_null" CHECK (NOT NULL subscription_id),
	CONSTRAINT "channel_subscriptions_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "channel_subscriptions_channel_id_not_null" CHECK (NOT NULL channel_id),
	CONSTRAINT "channel_subscriptions_notifications_enabled_not_null" CHECK (NOT NULL notifications_enabled),
	CONSTRAINT "channel_subscriptions_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"channel_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "channels_channel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"post_permission_level" "channel_post_permission_enum" DEFAULT 'admin' NOT NULL,
	CONSTRAINT "channels_channel_id_not_null" CHECK (NOT NULL channel_id),
	CONSTRAINT "channels_name_not_null" CHECK (NOT NULL name),
	CONSTRAINT "channels_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "channels_post_permission_level_not_null" CHECK (NOT NULL post_permission_level)
);
--> statement-breakpoint
CREATE TABLE "files" (
	"file_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"location" text NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "files_file_id_not_null" CHECK (NOT NULL file_id),
	CONSTRAINT "files_file_name_not_null" CHECK (NOT NULL file_name),
	CONSTRAINT "files_location_not_null" CHECK (NOT NULL location)
);
--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"code_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invite_codes_code_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"role_keys" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_by" text,
	"used_at" timestamp with time zone,
	"revoked_by" text,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "invite_codes_code_id_not_null" CHECK (NOT NULL code_id),
	CONSTRAINT "invite_codes_code_not_null" CHECK (NOT NULL code),
	CONSTRAINT "invite_codes_role_keys_not_null" CHECK (NOT NULL role_keys),
	CONSTRAINT "invite_codes_created_by_not_null" CHECK (NOT NULL created_by),
	CONSTRAINT "invite_codes_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "invite_codes_expires_at_not_null" CHECK (NOT NULL expires_at)
);
--> statement-breakpoint
CREATE TABLE "mentees" (
	"mentee_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentees_mentee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"learning_goals" text,
	"experience_level" text,
	"preferred_mentor_type" text,
	"status" "mentee_status_enum" DEFAULT 'active' NOT NULL,
	"resume_file_id" uuid,
	"personal_interests" text,
	"role_model_inspiration" text,
	"hope_to_gain_responses" jsonb,
	"mentor_qualities" jsonb,
	"preferred_meeting_format" "meeting_format_enum",
	"hours_per_month_commitment" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentees_mentee_id_not_null" CHECK (NOT NULL mentee_id),
	CONSTRAINT "mentees_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "mentees_status_not_null" CHECK (NOT NULL status),
	CONSTRAINT "mentees_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "mentees_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "mentor_recommendations" (
	"recommendation_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_recommendations_recommendation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"recommended_mentor_ids" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	CONSTRAINT "mentor_recommendations_recommendation_id_not_null" CHECK (NOT NULL recommendation_id),
	CONSTRAINT "mentor_recommendations_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "mentor_recommendations_recommended_mentor_ids_not_null" CHECK (NOT NULL recommended_mentor_ids),
	CONSTRAINT "mentor_recommendations_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"mentor_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentors_mentor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"mentorship_preferences" text,
	"years_of_service" integer,
	"eligibility_data" jsonb,
	"status" "mentor_status_enum" DEFAULT 'requested' NOT NULL,
	"resume_file_id" uuid,
	"strengths" jsonb DEFAULT '[]'::jsonb,
	"personal_interests" text,
	"why_interested_responses" jsonb,
	"career_advice" text,
	"preferred_mentee_career_stages" jsonb,
	"preferred_meeting_format" "meeting_format_enum",
	"hours_per_month_commitment" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentors_mentor_id_not_null" CHECK (NOT NULL mentor_id),
	CONSTRAINT "mentors_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "mentors_status_not_null" CHECK (NOT NULL status),
	CONSTRAINT "mentors_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "mentors_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "mentorship_embeddings" (
	"embedding_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentorship_embeddings_embedding_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"user_type" "mentorship_user_type_enum" NOT NULL,
	"why_interested_embedding" vector(512),
	"hope_to_gain_embedding" vector(512),
	"profile_embedding" vector(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentorship_embeddings_embedding_id_not_null" CHECK (NOT NULL embedding_id),
	CONSTRAINT "mentorship_embeddings_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "mentorship_embeddings_user_type_not_null" CHECK (NOT NULL user_type),
	CONSTRAINT "mentorship_embeddings_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "mentorship_embeddings_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "mentorship_matches" (
	"match_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentorship_matches_match_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"requestor_user_id" text,
	"mentor_user_id" text,
	"status" "match_status_enum" DEFAULT 'pending' NOT NULL,
	"matched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message" text,
	CONSTRAINT "mentorship_matches_match_id_not_null" CHECK (NOT NULL match_id),
	CONSTRAINT "mentorship_matches_status_not_null" CHECK (NOT NULL status),
	CONSTRAINT "mentorship_matches_matched_at_not_null" CHECK (NOT NULL matched_at)
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"attachment_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_attachments_attachment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"file_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_attachments_attachment_id_not_null" CHECK (NOT NULL attachment_id),
	CONSTRAINT "message_attachments_message_id_not_null" CHECK (NOT NULL message_id),
	CONSTRAINT "message_attachments_file_id_not_null" CHECK (NOT NULL file_id),
	CONSTRAINT "message_attachments_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "message_blasts" (
	"blast_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_blasts_blast_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sender_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"target_audience" jsonb,
	"sent_at" timestamp with time zone,
	"valid_until" timestamp with time zone DEFAULT (now() + '24:00:00'::interval) NOT NULL,
	"status" "message_blast_status_enum" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_blasts_blast_id_not_null" CHECK (NOT NULL blast_id),
	CONSTRAINT "message_blasts_sender_id_not_null" CHECK (NOT NULL sender_id),
	CONSTRAINT "message_blasts_title_not_null" CHECK (NOT NULL title),
	CONSTRAINT "message_blasts_content_not_null" CHECK (NOT NULL content),
	CONSTRAINT "message_blasts_valid_until_not_null" CHECK (NOT NULL valid_until),
	CONSTRAINT "message_blasts_status_not_null" CHECK (NOT NULL status),
	CONSTRAINT "message_blasts_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "message_blasts_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"reaction_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_reactions_reaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "message_reactions_reaction_id_not_null" CHECK (NOT NULL reaction_id),
	CONSTRAINT "message_reactions_message_id_not_null" CHECK (NOT NULL message_id),
	CONSTRAINT "message_reactions_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "message_reactions_emoji_not_null" CHECK (NOT NULL emoji),
	CONSTRAINT "message_reactions_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"channel_id" integer NOT NULL,
	"sender_id" text,
	"message" text,
	"attachment_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_message_id_not_null" CHECK (NOT NULL message_id),
	CONSTRAINT "messages_channel_id_not_null" CHECK (NOT NULL channel_id),
	CONSTRAINT "messages_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"subscription_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "push_subscriptions_subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"keys" jsonb,
	"topics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "push_subscriptions_subscription_id_not_null" CHECK (NOT NULL subscription_id),
	CONSTRAINT "push_subscriptions_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "push_subscriptions_endpoint_not_null" CHECK (NOT NULL endpoint),
	CONSTRAINT "push_subscriptions_p256dh_not_null" CHECK (NOT NULL p256dh),
	CONSTRAINT "push_subscriptions_auth_not_null" CHECK (NOT NULL auth),
	CONSTRAINT "push_subscriptions_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "push_subscriptions_is_active_not_null" CHECK (NOT NULL is_active)
);
--> statement-breakpoint
CREATE TABLE "report_attachments" (
	"attachment_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_attachments_attachment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"report_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_attachments_attachment_id_not_null" CHECK (NOT NULL attachment_id),
	CONSTRAINT "report_attachments_report_id_not_null" CHECK (NOT NULL report_id),
	CONSTRAINT "report_attachments_file_id_not_null" CHECK (NOT NULL file_id),
	CONSTRAINT "report_attachments_created_at_not_null" CHECK (NOT NULL created_at)
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "report_category_enum",
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "report_status_enum" DEFAULT 'Pending' NOT NULL,
	"submitted_by" text NOT NULL,
	"assigned_to" text,
	"assigned_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved" timestamp with time zone,
	CONSTRAINT "reports_report_id_not_null" CHECK (NOT NULL report_id),
	CONSTRAINT "reports_title_not_null" CHECK (NOT NULL title),
	CONSTRAINT "reports_description_not_null" CHECK (NOT NULL description),
	CONSTRAINT "reports_status_not_null" CHECK (NOT NULL status),
	CONSTRAINT "reports_submitted_by_not_null" CHECK (NOT NULL submitted_by),
	CONSTRAINT "reports_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "reports_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_role_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"namespace" "role_namespace_enum" NOT NULL,
	"subject_id" text,
	"action" text NOT NULL,
	"role_key" text NOT NULL,
	"channel_id" integer,
	"metadata" jsonb,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_role_id_not_null" CHECK (NOT NULL role_id),
	CONSTRAINT "roles_namespace_not_null" CHECK (NOT NULL namespace),
	CONSTRAINT "roles_action_not_null" CHECK (NOT NULL action),
	CONSTRAINT "roles_role_key_not_null" CHECK (NOT NULL role_key),
	CONSTRAINT "roles_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "roles_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token"),
	CONSTRAINT "session_id_not_null" CHECK (NOT NULL id),
	CONSTRAINT "session_expires_at_not_null" CHECK (NOT NULL expires_at),
	CONSTRAINT "session_token_not_null" CHECK (NOT NULL token),
	CONSTRAINT "session_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "session_updated_at_not_null" CHECK (NOT NULL updated_at),
	CONSTRAINT "session_user_id_not_null" CHECK (NOT NULL user_id)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_number" text,
	"image" uuid,
	"rank" text,
	"department" text,
	"branch" text,
	"position_type" "position_type_enum",
	"location" text,
	"about" text,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"civilian_career" text,
	"linkedin" text,
	"signal_visibility" "visibility_enum" DEFAULT 'private' NOT NULL,
	"email_visibility" "visibility_enum" DEFAULT 'private' NOT NULL,
	"linkedin_visibility" "visibility_enum" DEFAULT 'public' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_id_not_null" CHECK (NOT NULL id),
	CONSTRAINT "user_name_not_null" CHECK (NOT NULL name),
	CONSTRAINT "user_email_not_null" CHECK (NOT NULL email),
	CONSTRAINT "user_email_verified_not_null" CHECK (NOT NULL email_verified),
	CONSTRAINT "user_signal_visibility_not_null" CHECK (NOT NULL signal_visibility),
	CONSTRAINT "user_email_visibility_not_null" CHECK (NOT NULL email_visibility),
	CONSTRAINT "user_linkedin_visibility_not_null" CHECK (NOT NULL linkedin_visibility),
	CONSTRAINT "user_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "user_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_id_not_null" CHECK (NOT NULL id),
	CONSTRAINT "verification_identifier_not_null" CHECK (NOT NULL identifier),
	CONSTRAINT "verification_value_not_null" CHECK (NOT NULL value),
	CONSTRAINT "verification_expires_at_not_null" CHECK (NOT NULL expires_at),
	CONSTRAINT "verification_created_at_not_null" CHECK (NOT NULL created_at),
	CONSTRAINT "verification_updated_at_not_null" CHECK (NOT NULL updated_at)
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" text,
	"metadata" jsonb,
	CONSTRAINT "pk_user_roles" PRIMARY KEY("user_id","role_id"),
	CONSTRAINT "user_roles_user_id_not_null" CHECK (NOT NULL user_id),
	CONSTRAINT "user_roles_role_id_not_null" CHECK (NOT NULL role_id),
	CONSTRAINT "user_roles_assigned_at_not_null" CHECK (NOT NULL assigned_at)
);

*/