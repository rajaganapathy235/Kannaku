import { Resend } from 'resend';

export interface SendResetEmailParams {
  email: string;
  name?: string;
  otp: string;
  resetLink?: string;
}

export async function sendPasswordResetEmail(
  params: SendResetEmailParams,
  apiKeyOverride?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey =
    apiKeyOverride ||
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Resend Email] RESEND_API_KEY is missing from environment variables.');
    return {
      success: false,
      error: 'RESEND_API_KEY environment variable is missing.',
    };
  }

  const fromAddress =
    process.env.RESEND_FROM_EMAIL || 'JustGST Billing <onboarding@resend.dev>';

  const resend = new Resend(apiKey);
  const recipientName = params.name || 'Valued User';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your JustGST Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.02em;">
        Just<span style="color: #10b981;">GST</span>
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">
        Fast, Offline-First Thermal POS & GST Billing
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 28px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
        Reset Your Account Password
      </h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Hello <strong>${recipientName}</strong>,<br>
        We received a request to reset the password for your JustGST account associated with <strong>${params.email}</strong>.
      </p>

      <!-- OTP Card -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #047857; margin-bottom: 8px;">
          Your 6-Digit Password Reset OTP Code
        </span>
        <div style="font-family: monospace, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #065f46; text-indent: 8px;">
          ${params.otp}
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
        Please enter this verification code in the app window to set your new password. This OTP code is valid for <strong>15 minutes</strong>.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          If you did not request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #64748b; margin: 0;">
        © ${new Date().getFullYear()} JustGST (justgst.in). All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: [params.email],
      subject: `JustGST Password Reset Code: ${params.otp}`,
      html: htmlContent,
    });

    if (data.error) {
      console.error('[Resend Email Error]:', data.error);
      return { success: false, error: data.error.message || 'Failed to send email via Resend' };
    }

    return { success: true, messageId: data.data?.id };
  } catch (err: any) {
    console.error('[Resend Email Exception]:', err);
    return { success: false, error: err?.message || 'Error executing Resend API call' };
  }
}
