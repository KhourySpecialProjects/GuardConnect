-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create new enums
DO $$ BEGIN
 CREATE TYPE "position_type_enum" AS ENUM('active', 'guard', 'reserve');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "service_type_enum" AS ENUM('enlisted', 'officer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "meeting_format_enum" AS ENUM('in-person', 'virtual', 'hybrid', 'no-preference');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "career_stage_enum" AS ENUM('new-soldiers', 'junior-ncos', 'senior-ncos', 'junior-officers', 'senior-officers', 'transitioning', 'no-preference');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add new columns to mentors table
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "position_type" "position_type_enum";
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "service_type" "service_type_enum";
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "detailed_position" text;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "detailed_rank" text;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "resume_file_id" uuid REFERENCES "files"("file_id") ON DELETE SET NULL;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "strengths" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "personal_interests" text;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "why_interested_responses" jsonb;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "career_advice" text;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "preferred_mentee_career_stages" jsonb;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "preferred_meeting_format" "meeting_format_enum";
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "hours_per_month_commitment" integer;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "mentors" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add constraints to mentors table
DO $$ BEGIN
 ALTER TABLE "mentors" ADD CONSTRAINT "ck_mentors_hours_per_month" CHECK ("hours_per_month_commitment" IS NULL OR "hours_per_month_commitment" > 0);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "mentors" ADD CONSTRAINT "ck_mentors_strengths_limit" CHECK (jsonb_array_length(COALESCE("strengths", '[]'::jsonb)) <= 5);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes to mentors table
CREATE INDEX IF NOT EXISTS "ix_mentors_status" ON "mentors"("status");
CREATE INDEX IF NOT EXISTS "ix_mentors_resume_file_id" ON "mentors"("resume_file_id");

-- Add new columns to mentees table
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "position_type" "position_type_enum";
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "service_type" "service_type_enum";
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "detailed_position" text;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "detailed_rank" text;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "resume_file_id" uuid REFERENCES "files"("file_id") ON DELETE SET NULL;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "personal_interests" text;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "role_model_inspiration" text;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "hope_to_gain_responses" jsonb;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "mentor_qualities" jsonb;
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "preferred_meeting_format" "meeting_format_enum";
ALTER TABLE "mentees" ADD COLUMN IF NOT EXISTS "hours_per_month_commitment" integer;

-- Add constraints to mentees table
DO $$ BEGIN
 ALTER TABLE "mentees" ADD CONSTRAINT "ck_mentees_hours_per_month" CHECK ("hours_per_month_commitment" IS NULL OR "hours_per_month_commitment" > 0);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes to mentees table
CREATE INDEX IF NOT EXISTS "ix_mentees_resume_file_id" ON "mentees"("resume_file_id");

-- Create mentorship_embeddings table
CREATE TABLE IF NOT EXISTS "mentorship_embeddings" (
	"embedding_id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"user_type" text NOT NULL,
	"why_interested_embedding" vector(1536),
	"hope_to_gain_embedding" vector(1536),
	"profile_embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for mentorship_embeddings table
CREATE UNIQUE INDEX IF NOT EXISTS "ux_mentorship_embeddings_user_type" ON "mentorship_embeddings"("user_id", "user_type");
CREATE INDEX IF NOT EXISTS "ix_mentorship_embeddings_user_id" ON "mentorship_embeddings"("user_id");
CREATE INDEX IF NOT EXISTS "ix_mentorship_embeddings_user_type" ON "mentorship_embeddings"("user_type");

-- Create vector similarity index for profile_embedding (using ivfflat for approximate nearest neighbor search)
-- Note: This index requires at least some data. You may want to create it after initial data is loaded.
-- CREATE INDEX IF NOT EXISTS "ix_mentorship_embeddings_profile_embedding_vector" ON "mentorship_embeddings" USING ivfflat ("profile_embedding" vector_cosine_ops) WITH (lists = 100);

