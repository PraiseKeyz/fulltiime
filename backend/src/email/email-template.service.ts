import { Injectable, Logger } from '@nestjs/common';
import { TEMPLATES } from './email.templates.js';

type Vars = Record<string, string | number | boolean | null | undefined>;

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  render(templateName: string, variables: Vars = {}): string {
    const template = TEMPLATES[templateName.toLowerCase()];
    if (!template) {
      this.logger.error(`Unknown email template: ${templateName}`);
      throw new Error(`Unknown email template: ${templateName}`);
    }
    return template(variables);
  }
}
