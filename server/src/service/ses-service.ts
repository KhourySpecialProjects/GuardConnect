import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import log from "../utils/logger.js";

function buildInviteEmailHtml(inviteLink: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f4f4f4">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0">
    <div style="background:#000;padding:24px 32px">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">GuardConnect</h1>
    </div>
    <div style="padding:32px">
      <h2 style="margin:0 0 12px;font-size:18px;color:#111">You've been invited</h2>
      <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.5">
        An admin has invited you to join the GuardConnect platform. Click the button below to create your account.
      </p>
      <a href="${inviteLink}" style="display:inline-block;background:#000;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600">
        Accept Invitation
      </a>
      <p style="margin:24px 0 0;color:#888;font-size:12px;word-break:break-all">
        Or copy this link into your browser: ${inviteLink}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export class SesService {
  private client: SESClient | null = null;
  private fromEmail: string | null = null;

  constructor() {
    const fromEmail = process.env.SES_FROM_EMAIL;
    if (!fromEmail) {
      log.warn("SES_FROM_EMAIL is not set — invite emails will not be sent");
      return;
    }
    this.fromEmail = fromEmail;
    this.client = new SESClient({
      region: process.env.AWS_REGION ?? "us-east-1",
    });
  }

  async sendInviteEmail(
    toEmail: string,
    inviteLink: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.client || !this.fromEmail) {
      return { success: false, error: "SES_FROM_EMAIL is not configured" };
    }

    try {
      const result = await this.client.send(
        new SendEmailCommand({
          Source: this.fromEmail,
          Destination: { ToAddresses: [toEmail] },
          Message: {
            Subject: { Data: "You've been invited to join GuardConnect" },
            Body: {
              Html: { Data: buildInviteEmailHtml(inviteLink) },
              Text: {
                Data: `You've been invited to join GuardConnect. Create your account here: ${inviteLink}`,
              },
            },
          },
        }),
      );
      log.info({ toEmail, messageId: result.MessageId }, "Invite email sent");
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn({ toEmail, err: message }, "Failed to send invite email");
      return { success: false, error: message };
    }
  }
}

export const sesService = new SesService();
