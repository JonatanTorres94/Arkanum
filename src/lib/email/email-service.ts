export interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<void>;
}
