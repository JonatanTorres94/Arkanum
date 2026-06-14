import { Resend } from "resend";
import type { EmailService, SendEmailOptions } from "./email-service";

export class ResendEmailService implements EmailService {
  private readonly client: Resend;

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY);
  }

  async send(options: SendEmailOptions): Promise<void> {
    const { error } = await this.client.emails.send(options);
    if (error) {
      throw new Error(`[ResendEmailService] ${error.message}`);
    }
  }
}
