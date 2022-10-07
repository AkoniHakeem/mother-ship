import { Logger } from '../logger/logger';
import sgMail, { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import { MAIL_API_KEY } from '../lib/projectConstants';

export class EmailService {
  static async send(
    options: MailDataRequired,
    substitutionWrappers: [string, string] = ['{{', '}}'],
  ): Promise<[ClientResponse, Record<string, unknown>] | undefined> {
    try {
      if (typeof options === undefined) {
        throw new Error('Invalid Mail options');
      }

      sgMail.setSubstitutionWrappers(...substitutionWrappers);
      sgMail.setApiKey(MAIL_API_KEY);
      const mailResponse = await sgMail.send(options);
      return mailResponse;
    } catch (error) {
      Logger.info(error, 'emailService');
      return undefined;
    }
  }
}
