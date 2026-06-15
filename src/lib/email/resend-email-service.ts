import { Resend } from "resend";
import type { EmailService, SendEmailOptions } from "./email-service";

export class ResendEmailService implements EmailService {
  async send(options: SendEmailOptions): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[ResendEmailService] RESEND_API_KEY not set — email skipped");
      return;
    }
    const client = new Resend(apiKey);
    const { error } = await client.emails.send(options);
    if (error) {
      throw new Error(`[ResendEmailService] ${error.message}`);
    }
  }
}
