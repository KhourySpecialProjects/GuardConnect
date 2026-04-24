import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import twilio from "twilio";

interface SMSResult {
  phoneNumber: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BroadcastResult {
  total: number;
  successful: number;
  failed: number;
  results: SMSResult[];
}

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getTwilioSecrets() {
  if (process.env.DEV_ENV === "true") {
    return {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    };
  } else {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: "prod/guardconnect/twilio" }),
    );
    return JSON.parse(response.SecretString!);
  }
}

export class TwilioSMSService {
  private client: ReturnType<typeof twilio>;
  private fromNumber: string;
  private readonly DEFAULT_BATCH_SIZE = 10;
  private readonly DEFAULT_BATCH_DELAY_MS = 1000;

  private constructor(
    accountSid: string,
    authToken: string,
    fromNumber: string,
  ) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  static async create(): Promise<TwilioSMSService> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
      await getTwilioSecrets();

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Missing Twilio credentials in Secrets Manager.");
    }

    return new TwilioSMSService(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
    );
  }

  /**
   * Send SMS to a single recipient
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    console.log(`📱 Attempting to send SMS to ${phoneNumber}`);
    console.log(`📝 Message: ${message.substring(0, 50)}...`);

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber, // Must be in E.164 format: +1234567890
      });

      console.log(`✅ SMS sent successfully! MessageSID: ${result.sid}`);
      console.log(`   Status: ${result.status}`);

      return {
        phoneNumber,
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error);
      return {
        phoneNumber,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Broadcast SMS to multiple recipients with rate limiting
   */
  async broadcast(
    phoneNumbers: string[],
    message: string,
    options?: {
      batchSize?: number;
      batchDelayMs?: number;
    },
  ): Promise<BroadcastResult> {
    console.log(`📢 Starting broadcast to ${phoneNumbers.length} recipients`);

    const batchSize = options?.batchSize || this.DEFAULT_BATCH_SIZE;
    const batchDelayMs = options?.batchDelayMs || this.DEFAULT_BATCH_DELAY_MS;

    const results: SMSResult[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);
      console.log(
        `📦 Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(phoneNumbers.length / batchSize)}`,
      );

      // Send batch in parallel
      const batchPromises = batch.map((phoneNumber) =>
        this.sendSMS(phoneNumber, message),
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Collect results
      batchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          results.push({
            phoneNumber: "unknown",
            success: false,
            error: result.reason,
          });
        }
      });

      // Delay between batches (except for last batch)
      if (i + batchSize < phoneNumbers.length) {
        console.log(`⏳ Waiting ${batchDelayMs}ms before next batch...`);
        await this.delay(batchDelayMs);
      }
    }

    // Calculate summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(
      `📊 Broadcast complete: ${successful} successful, ${failed} failed out of ${phoneNumbers.length} total`,
    );

    return {
      total: phoneNumbers.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Validate phone number format (E.164)
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format: +[country code][number]
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Sanitize and validate phone numbers
   */
  sanitizePhoneNumbers(phoneNumbers: string[]): string[] {
    return phoneNumbers
      .map((phone) => phone.trim())
      .filter((phone) => this.isValidPhoneNumber(phone));
  }

  /**
   * Get message status (for tracking delivery)
   */
  async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      console.error(`Failed to fetch message status:`, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
