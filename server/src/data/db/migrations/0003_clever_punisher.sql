CREATE TYPE "public"."report_status_enum" AS ENUM('assigned', 'resolved', 'in_progress', 'pending');--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"status" "report_status_enum" DEFAULT 'pending' NOT NULL,
	"comments" text,
	"issued_to" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ix_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_reports_created_at" ON "reports" USING btree ("created_at");