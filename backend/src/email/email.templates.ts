// Branded, email-client-safe HTML templates (table-based, inline styles).
// Inlined as TS so they bundle cleanly into the webpack/CommonJS output —
// no runtime filesystem reads, nothing to copy into dist.

type Vars = Record<string, string | number | boolean | null | undefined>;

const BRAND = {
  name:    'Fulltiime',
  green:   '#0a7c42',
  greenDk: '#075c31',
  ink:     '#0f172a',
  muted:   '#64748b',
  bg:      '#f1f5f9',
  card:    '#ffffff',
  border:  '#e2e8f0',
  site:    'https://fulltiime.com',
};

// Escape text rendered into element content
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape a URL placed into an href attribute
function escUrl(v: unknown): string {
  return String(v ?? '').replace(/"/g, '%22').replace(/\s/g, '');
}

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout({ preheader, heading, body }: { preheader: string; heading: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <span style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND.green};border-radius:14px 14px 0 0;padding:22px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;">FULLTIIME</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-top:0;border-radius:0 0 14px 14px;padding:36px 32px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND.ink};font-weight:800;">${esc(heading)}</h1>
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};">
                You received this email because you have an account with ${BRAND.name}.
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.ink};">${text}</p>`;
}

function muted(text: string) {
  return `<p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${text}</p>`;
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
    <tr>
      <td style="border-radius:10px;background:${BRAND.green};">
        <a href="${escUrl(url)}" target="_blank"
           style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
          ${esc(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function linkFallback(url: string) {
  return `<p style="margin:0 0 4px;font-size:12px;color:${BRAND.muted};">Or paste this link into your browser:</p>
  <p style="margin:0;font-size:12px;word-break:break-all;"><a href="${escUrl(url)}" style="color:${BRAND.green};">${esc(url)}</a></p>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function welcomeTemplate(vars: Vars) {
  const name = esc(vars.name ?? 'there');
  return layout({
    preheader: 'Welcome to Fulltiime — your home for live football.',
    heading:   `Welcome, ${name}! ⚽`,
    body: `
      ${paragraph(`Thanks for joining <strong>${BRAND.name}</strong> — your front-row seat to live scores, fixtures, standings and football news from around the world.`)}
      ${paragraph('Follow your favourite leagues and clubs, and never miss a moment.')}
      ${button('Explore Fulltiime', BRAND.site)}
      ${muted('If you didn’t create this account, you can safely ignore this email.')}
    `,
  });
}

export function verifyEmailTemplate(vars: Vars) {
  const name = esc(vars.name ?? 'there');
  const url  = String(vars.verifyUrl ?? BRAND.site);
  return layout({
    preheader: 'Confirm your email to activate your Fulltiime account.',
    heading:   'Verify your email',
    body: `
      ${paragraph(`Hi ${name}, please confirm your email address to finish setting up your ${BRAND.name} account.`)}
      ${button('Verify Email', url)}
      ${linkFallback(url)}
      <div style="height:16px;"></div>
      ${muted('This link expires in 24 hours. If you didn’t sign up, you can ignore this email.')}
    `,
  });
}

export function passwordResetTemplate(vars: Vars) {
  const name = esc(vars.name ?? 'there');
  const url  = String(vars.resetUrl ?? BRAND.site);
  return layout({
    preheader: 'Reset your Fulltiime password.',
    heading:   'Reset your password',
    body: `
      ${paragraph(`Hi ${name}, we received a request to reset your ${BRAND.name} password. Click below to choose a new one.`)}
      ${button('Reset Password', url)}
      ${linkFallback(url)}
      <div style="height:16px;"></div>
      ${muted('This link expires in 1 hour. If you didn’t request a reset, your password is still safe — just ignore this email.')}
    `,
  });
}

export const TEMPLATES: Record<string, (vars: Vars) => string> = {
  'welcome':        welcomeTemplate,
  'verify-email':   verifyEmailTemplate,
  'password-reset': passwordResetTemplate,
};
