import { SNSClient, PublishCommand, type PublishCommandInput } from "@aws-sdk/client-sns";

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

export class SMSBroadcastService {
  private snsClient: SNSClient;
  private readonly DEFAULT_BATCH_SIZE = 10;
  private readonly DEFAULT_BATCH_DELAY_MS = 1000;

  constructor(region: string = "us-east-1") {
    this.snsClient = new SNSClient({ region });
  }

  /**
   * Send SMS to a single recipient
   */
  async sendSMS(
    phoneNumber: string,
    message: string,
    isTransactional: boolean = true,
  ): Promise<SMSResult> {
    try {
      const params: PublishCommandInput = {
        Message: message,
        PhoneNumber: phoneNumber, // Must be in E.164 format: +1234567890
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: isTransactional ? "Transactional" : "Promotional",
          },
        },
      };

      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);

      return {
        phoneNumber,
        success: true,
        messageId: response.MessageId,
      };
    } catch (error) {
      console.error(`Failed to send SMS to ${phoneNumber}:`, error);
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
      isTransactional?: boolean;
    },
  ): Promise<BroadcastResult> {
    const batchSize = options?.batchSize || this.DEFAULT_BATCH_SIZE;
    const batchDelayMs = options?.batchDelayMs || this.DEFAULT_BATCH_DELAY_MS;
    const isTransactional = options?.isTransactional ?? true;

    const results: SMSResult[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);

      // Send batch in parallel
      const batchPromises = batch.map((phoneNumber) =>
        this.sendSMS(phoneNumber, message, isTransactional),
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
        await this.delay(batchDelayMs);
      }
    }

    // Calculate summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
