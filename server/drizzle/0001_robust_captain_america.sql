ALTER TABLE "account" DROP CONSTRAINT "account_id_not_null";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_account_id_not_null";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_id_not_null";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_not_null";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_created_at_not_null";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "channel_subscriptions" DROP CONSTRAINT "channel_subscriptions_subscription_id_not_null";--> statement-breakpoint
ALTER TABLE "channel_subscriptions" DROP CONSTRAINT "channel_subscriptions_user_id_not_null";--> statement-breakpoint
ALTER TABLE "channel_subscriptions" DROP CONSTRAINT "channel_subscriptions_channel_id_not_null";--> statement-breakpoint
ALTER TABLE "channel_subscriptions" DROP CONSTRAINT "channel_subscriptions_notifications_enabled_not_null";--> statement-breakpoint
ALTER TABLE "channel_subscriptions" DROP CONSTRAINT "channel_subscriptions_created_at_not_null";--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT "channels_channel_id_not_null";--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT "channels_name_not_null";--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT "channels_created_at_not_null";--> statement-breakpoint
ALTER TABLE "channels" DROP CONSTRAINT "channels_post_permission_level_not_null";--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_file_id_not_null";--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_file_name_not_null";--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_location_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_code_id_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_code_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_role_keys_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_created_by_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_created_at_not_null";--> statement-breakpoint
ALTER TABLE "invite_codes" DROP CONSTRAINT "invite_codes_expires_at_not_null";--> statement-breakpoint
ALTER TABLE "mentees" DROP CONSTRAINT "mentees_mentee_id_not_null";--> statement-breakpoint
ALTER TABLE "mentees" DROP CONSTRAINT "mentees_user_id_not_null";--> statement-breakpoint
ALTER TABLE "mentees" DROP CONSTRAINT "mentees_status_not_null";--> statement-breakpoint
ALTER TABLE "mentees" DROP CONSTRAINT "mentees_created_at_not_null";--> statement-breakpoint
ALTER TABLE "mentees" DROP CONSTRAINT "mentees_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "mentor_recommendations" DROP CONSTRAINT "mentor_recommendations_recommendation_id_not_null";--> statement-breakpoint
ALTER TABLE "mentor_recommendations" DROP CONSTRAINT "mentor_recommendations_user_id_not_null";--> statement-breakpoint
ALTER TABLE "mentor_recommendations" DROP CONSTRAINT "mentor_recommendations_recommended_mentor_ids_not_null";--> statement-breakpoint
ALTER TABLE "mentor_recommendations" DROP CONSTRAINT "mentor_recommendations_created_at_not_null";--> statement-breakpoint
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_mentor_id_not_null";--> statement-breakpoint
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_user_id_not_null";--> statement-breakpoint
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_status_not_null";--> statement-breakpoint
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_created_at_not_null";--> statement-breakpoint
ALTER TABLE "mentors" DROP CONSTRAINT "mentors_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" DROP CONSTRAINT "mentorship_embeddings_embedding_id_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" DROP CONSTRAINT "mentorship_embeddings_user_id_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" DROP CONSTRAINT "mentorship_embeddings_user_type_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" DROP CONSTRAINT "mentorship_embeddings_created_at_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" DROP CONSTRAINT "mentorship_embeddings_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_matches" DROP CONSTRAINT "mentorship_matches_match_id_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_matches" DROP CONSTRAINT "mentorship_matches_status_not_null";--> statement-breakpoint
ALTER TABLE "mentorship_matches" DROP CONSTRAINT "mentorship_matches_matched_at_not_null";--> statement-breakpoint
ALTER TABLE "message_attachments" DROP CONSTRAINT "message_attachments_attachment_id_not_null";--> statement-breakpoint
ALTER TABLE "message_attachments" DROP CONSTRAINT "message_attachments_message_id_not_null";--> statement-breakpoint
ALTER TABLE "message_attachments" DROP CONSTRAINT "message_attachments_file_id_not_null";--> statement-breakpoint
ALTER TABLE "message_attachments" DROP CONSTRAINT "message_attachments_created_at_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_blast_id_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_sender_id_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_title_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_content_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_valid_until_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_status_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_created_at_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" DROP CONSTRAINT "message_blasts_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_reaction_id_not_null";--> statement-breakpoint
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_message_id_not_null";--> statement-breakpoint
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_user_id_not_null";--> statement-breakpoint
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_emoji_not_null";--> statement-breakpoint
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_created_at_not_null";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_message_id_not_null";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_channel_id_not_null";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_created_at_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_subscription_id_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_user_id_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_endpoint_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_p256dh_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_auth_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_created_at_not_null";--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_is_active_not_null";--> statement-breakpoint
ALTER TABLE "report_attachments" DROP CONSTRAINT "report_attachments_attachment_id_not_null";--> statement-breakpoint
ALTER TABLE "report_attachments" DROP CONSTRAINT "report_attachments_report_id_not_null";--> statement-breakpoint
ALTER TABLE "report_attachments" DROP CONSTRAINT "report_attachments_file_id_not_null";--> statement-breakpoint
ALTER TABLE "report_attachments" DROP CONSTRAINT "report_attachments_created_at_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_report_id_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_title_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_description_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_status_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_submitted_by_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_created_at_not_null";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_role_id_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_namespace_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_action_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_role_key_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_created_at_not_null";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_id_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_expires_at_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_token_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_created_at_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_id_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_name_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_verified_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_signal_visibility_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_visibility_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_linkedin_visibility_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_created_at_not_null";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_id_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_identifier_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_value_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_expires_at_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_created_at_not_null";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verification_updated_at_not_null";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_not_null";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_not_null";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_assigned_at_not_null";--> statement-breakpoint
ALTER TABLE "message_blasts" ALTER COLUMN "valid_until" SET DEFAULT NOW() + INTERVAL '24 hours';--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscriptions" ADD CONSTRAINT "channel_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscriptions" ADD CONSTRAINT "channel_subscriptions_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_user_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_revoked_by_user_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentees" ADD CONSTRAINT "mentees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentees" ADD CONSTRAINT "mentees_resume_file_id_files_file_id_fk" FOREIGN KEY ("resume_file_id") REFERENCES "public"."files"("file_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_recommendations" ADD CONSTRAINT "mentor_recommendations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_resume_file_id_files_file_id_fk" FOREIGN KEY ("resume_file_id") REFERENCES "public"."files"("file_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_embeddings" ADD CONSTRAINT "mentorship_embeddings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_matches" ADD CONSTRAINT "mentorship_matches_requestor_user_id_user_id_fk" FOREIGN KEY ("requestor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_matches" ADD CONSTRAINT "mentorship_matches_mentor_user_id_user_id_fk" FOREIGN KEY ("mentor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_file_id_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("file_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_blasts" ADD CONSTRAINT "message_blasts_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachments" ADD CONSTRAINT "report_attachments_report_id_reports_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("report_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_attachments" ADD CONSTRAINT "report_attachments_file_id_files_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("file_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_channel_id_channels_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("channel_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_image_files_file_id_fk" FOREIGN KEY ("image") REFERENCES "public"."files"("file_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_channel_subscriptions_user_channel" ON "channel_subscriptions" USING btree ("user_id","channel_id");--> statement-breakpoint
CREATE INDEX "ix_channel_subscriptions_user_id" ON "channel_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_channel_subscriptions_channel_id" ON "channel_subscriptions" USING btree ("channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_channels_name" ON "channels" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_invite_codes_code" ON "invite_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ix_invite_codes_created_by" ON "invite_codes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "ix_invite_codes_used_by" ON "invite_codes" USING btree ("used_by");--> statement-breakpoint
CREATE INDEX "ix_invite_codes_expires_at" ON "invite_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ix_mentees_user_id" ON "mentees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_mentees_status" ON "mentees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_mentees_resume_file_id" ON "mentees" USING btree ("resume_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_mentor_recommendations_user_id" ON "mentor_recommendations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_mentors_user_id" ON "mentors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_mentors_status" ON "mentors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_mentors_resume_file_id" ON "mentors" USING btree ("resume_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_mentorship_embeddings_user_type" ON "mentorship_embeddings" USING btree ("user_id","user_type");--> statement-breakpoint
CREATE INDEX "ix_mentorship_embeddings_user_id" ON "mentorship_embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_mentorship_embeddings_user_type" ON "mentorship_embeddings" USING btree ("user_type");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_mentorship_matches_pair" ON "mentorship_matches" USING btree ("requestor_user_id","mentor_user_id");--> statement-breakpoint
CREATE INDEX "ix_mentorship_matches_requestor_user_id" ON "mentorship_matches" USING btree ("requestor_user_id");--> statement-breakpoint
CREATE INDEX "ix_mentorship_matches_mentor_user_id" ON "mentorship_matches" USING btree ("mentor_user_id");--> statement-breakpoint
CREATE INDEX "ix_mentorship_matches_status" ON "mentorship_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_message_attachments_message_id" ON "message_attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "ix_message_attachments_file_id" ON "message_attachments" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_message_attachments_message_file" ON "message_attachments" USING btree ("message_id","file_id");--> statement-breakpoint
CREATE INDEX "ix_message_blasts_sender_id" ON "message_blasts" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "ix_message_blasts_status" ON "message_blasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ix_message_blasts_valid_until" ON "message_blasts" USING btree ("valid_until");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_message_reactions_user" ON "message_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "ix_message_reactions_message_id" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "ix_message_reactions_user_id" ON "message_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_messages_channel_id" ON "messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "ix_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_push_subscriptions_endpoint" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "ix_push_subscriptions_user_id" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_report_attachments_report_file" ON "report_attachments" USING btree ("report_id","file_id");--> statement-breakpoint
CREATE INDEX "ix_report_attachments_report_id" ON "report_attachments" USING btree ("report_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_roles_role_key" ON "roles" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "ix_roles_namespace_subject" ON "roles" USING btree ("namespace","subject_id");--> statement-breakpoint
CREATE INDEX "ix_roles_channel_id" ON "roles" USING btree ("channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_users_email" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ix_user_roles_role_id" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "ix_user_roles_user_assigned_by" ON "user_roles" USING btree ("user_id","assigned_by");